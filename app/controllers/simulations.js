'use strict';
/// @module simulation_controller
/// Server side simulation controller.


/// Module dependencies.
var uuid = require('node-uuid');
var mongoose = require('mongoose'),
    Simulation = mongoose.model('Simulation'),
    User = mongoose.model('User'),
    fs = require('fs'),
    _ = require('lodash');

var sockets = require('../lib/sockets');
var config = require('../../config/config');

var child_process = require('child_process');

// initialise cloudServices, depending on the environment
var cloudServices;
if(process.env.AWS_ACCESS_KEY_ID) {
    console.log('using the real cloud services!');
    cloudServices = require('../lib/cloud_services.js');
} else {
    console.log('process.env.AWS_ACCESS_KEY_ID not defined: using the fake cloud services');
    cloudServices = require('../lib/fake_cloud_services.js');
}

var util = require('util');

////////////////////////////////////
// The AWS server information
//
var awsData = { 'US West': {region: 'us-west-2',
                            image: 'ami-b8d2b088',
                            hardware: 'g2.2xlarge', // 'm1.small',  'ami-cc95f8fc',
                            price: 0},
                 'US East': {region: 'us-east-1',
                             image: 'ami-4d8d8924',
                             hardware: 'g2.2xlarge',
                             price: 0},
                 'Ireland': {region: 'eu-west-1',
                             image: 'ami-b4e313c3',
                             hardware: 'g2.2xlarge',
                             price: 0}
};

/////////////////////////////////////////////////
/// Find Simulation by id
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @param[in] next The next Nodejs function to be executed.
/// @param[in] id ID of the simulation instance to retrieve.
/// @return Simulation instance retrieval function.
exports.simulation = function(req, res, next, id) {
    // in routes/simulation.js, looks like app.param is always called
    // before other middlewares, so we need to manually check
    // authentication here. The code below is the same as
    // authorization.requiresLogin.
    if (!req.isAuthenticated()) {
        return res.send(401, 'User is not authorized');
    }

    // Load a simulation model based on the given id
    Simulation.loadBySimId(req.user.id, id, function(err, simulation) {
        // in case of error, hand it over to the next middleware
        if (err) return next(err);

        // If a simulation instance was not found, then return an error
        if (!simulation) {
            return next(new Error('Failed to load simulation ' + id));
        }

        // Add the new simulation to the request object
        // for future reference
        req.simulation = simulation;

        // hand over control to the next middleware
        next();
    });
};


//////////////////////////////////////////////////
// generate a ssh key name from a user email and
// a simulation id (used with AWS to generate and
// delete a unqiue key for each machine)
// @param[in] email: the user's email
// @param[in] sim_id: simulation id number
// @return a unique AWS name for the key
function getKeyName(email, sim_id) {
    return 'cs-' + sim_id + '-' + email;
}

////////////////////////////////////////////////////////////////
// Generates a script that will be executed when the simulation
// server is booted for the first time.
// @param[in] secret_token this token is used to call Cloudsim
//            to let it know who is calling.
// @param[in] world the simulation world to load.
// @param[in] cloneRepo
function generate_callback_script(secret_token, world, cloneRepo)
{
    // assume false if undefined
    cloneRepo = cloneRepo || false;

    var s = '';
    s += '#!/usr/bin/env bash\n';
     // script is executed as root, but we want to be ubuntu
    s += 'sudo su ubuntu << EOF\n';
    s += 'set -ex\n';
    s += 'logfile=/home/ubuntu/cloudsimi_setup.log\n';
    s += 'exec > \\$logfile 2>&1\n';
    s += '\n';
    if(cloneRepo) {
        s += 'cd /home/ubuntu\n';
        s += 'hg clone https://bitbucket.org/osrf/cloudsimi\n\n';
        // checkout a specific branch
        s += 'cd  /home/ubuntu/cloudsimi\n';
        s += 'hg co init\n';
    }

    s += '# cloudsim script to signal server ready\n';
    s += '/home/ubuntu/cloudsimi/callback_to_cloudsim_io.bash ';
    s += 'http://cloudsim.io ' + world + ' ' + secret_token + '\n\n';
    s += 'EOF\n';
    s += 'echo done!\n';

    return s;
}

/////////////////////////////////////////////////
/// Create a simulation
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Simulation create function.
exports.create = function(req, res) {

    // Create a new simulation instance based on the content of the
    // request
    var simulation = new Simulation(req.body);
    // Set the simulation user
    simulation.user = req.user;

    // find user and also update the next_sim_id to ensure a unique id
    // when we get multiple concurrent POSTS
    User.findByIdAndUpdate(req.user.id, {$inc:{next_sim_id: 1}}, function(err, user) {
        if(err) {
            // an unlikely error, since user is in req.
            console.log('Create Simulation failed. Error updating user simulation sim id in database: ' + err);
            res.jsonp(500, { error: err });
        } else {
            if (!user) {
                console.log('Create Simulation failed. Error finding user in database: ' + err);
                res.jsonp(500, { error: err });
                return;
            }
            // decrement because we update it first in findByIdAndUpdate
            simulation.sim_id = --user.next_sim_id;
            // we pick the appropriate machine based on the region specified
            // by the user
            var serverDetails = awsData[simulation.region];
            var keyName = getKeyName(req.user.email,  simulation.sim_id);
            cloudServices.generateKey(keyName, serverDetails.region, function(err, key) {
                if(err) {
                    console.log('Error generating key: ' + err);
                    res.jsonp(500, { error: err });
                } else {
                    var tags = {Name: 'simulator',
                            user: req.user.username,
                            id: simulation.sim_id};
                    // create a callback script with a secret token. This script will be executed when the
                    // server is booted for the first time. It can be found on the server at this path:
                    //    /var/lib/cloud/instance/user-data.txt
                    var token = uuid.v4();
                    var script = generate_callback_script(token, simulation.world, true);
                    // set date_launch just before we launch the simulation on the cloud
                    simulation.date_launch = Date.now();
                    cloudServices.launchSimulator(  serverDetails.region,
                                                    keyName,
                                                    serverDetails.hardware,
                                                    serverDetails.image,
                                                    tags,
                                                    script,
                                                    function (err, machineInfo) {
                        if(err) {
                            res.jsonp(500, { error: err });
                        } else {
                            simulation.machine_id = machineInfo.id;
                            simulation.secret_token = token;
                            simulation.server_price = serverDetails.price;
                            simulation.ssh_private_key = key;
                            simulation.machine_ip = 'N/A';
                            setTimeout(function () {

                                simulation.machine_ip = 'waiting';
                                cloudServices.simulatorStatus(machineInfo, function(err, state) {
                                    var s = 'Getting ip from AWS: machine:';
                                    s += util.inspect(machineInfo);
                                    s +=  ' status: ';
                                    s += util.inspect(state);
                                    console.log(s);
                                    simulation.machine_ip = state.ip;
                                    simulation.save(function(err) {
                                        if (err) {
                                            if(machineInfo.id) {
                                                console.log('error saving simulation info to db: ' + err);
                                                console.log('Terminating server ' + machineInfo.id);
                                                cloudServices.terminateSimulator(machineInfo, function () {});
                                            }
                                            console.log('Error getting machine ip');
                                            res.jsonp(500, { error: err });
                                        } else {
                                            // New IP: broadcast the news
                                            sockets.getUserSockets().notifyUser(req.user.id,
                                                                    'simulation_update',
                                                                    {data:simulation});

                                        }
                                    });
                                });
                            }, 30000);

                            // Save the simulation instance to the database
                            simulation.save(function(err) {
                                if (err) {
                                    if(machineInfo.id) {
                                        console.log('error saving simulation info to db: ' + err);
                                        console.log('Terminating server ' +  machineInfo.id);
                                        cloudServices.terminateSimulator(machineInfo, function () {});
                                    }
                                    return res.send('users/signup', {
                                        errors: err.errors,
                                        Simulation: simulation
                                    });
                                }
                                res.jsonp(simulation);
                                sockets.getUserSockets().notifyUser(req.user.id,
                                                        'simulation_create',
                                                         {data:simulation});

                            }); // simulation.save (simulatorInstance)
                        }
                    });  // launchSimulator
                }
            });  // gerenateKey
        }
    });  
};

/////////////////////////////////////////////////
/// Update a simulation
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object
/// @return Simulation update function.
exports.update = function(req, res) {

    // Get the simulation from the request
    var simulation = req.simulation;

    if (simulation.state === 'Terminated') {
        // don't rewrite history, just return.
        res.jsonp(simulation);
        return;
    }

    // Check if the update operation is to terminate a simulation
    if (req.body.state !== simulation.state &&
        req.body.state === 'Terminated') {
        exports.terminate(req, res);
        return;
    }

    // Check to make sure the region is not modified.
    if (req.body.region && simulation.region !== req.body.region) {

        // Create an error message.
        var error = {error: {
            msg: 'Cannot change the region of a running simulation',
            id: req.simulation.sim_id
        }};

        // Can't change the world.
        res.jsonp(error);
        return;
    }

    // use the lodash library to populate each
    // simulation attribute with the values in the
    // request body
    simulation = _.extend(simulation, req.body);

    // Save the updated simulation to the database
    simulation.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                Simulation: simulation
            });
        } else {
            res.jsonp(simulation);
            sockets.getUserSockets().notifyUser(req.user.id,
                                                'simulation_update',
                                                 {data:simulation});
        }
    });
};

/////////////////////////////////////////////////
/// Delete a simulation.
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Destroy function
exports.destroy = function(req, res) {

    // Get the simulation model
    var simulation = req.simulation;

    // Remove the simulation model from the database
    // TODO: We need to check to make sure the simulation instance has been
    // terminated
    simulation.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                Simulation: simulation
            });
        } else {
            res.jsonp(simulation);
            // notify the user from the other browsers

        }
    });
};

/////////////////////////////////////////////////
/// Terminate a running simulation
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Destroy function
exports.terminate = function(req, res) {
    // Get the simulation model
    var simulation = req.simulation;
    var user = req.user;
    var region = awsData[simulation.region].region;
    var machineInfo = {region: region,
                       id: simulation.machine_id};
    var keyName = getKeyName(user.email, simulation.sim_id);
    // delete the ssh key. If there is an error, report it
    // but try to shutdown the machine anyways
    cloudServices.deleteKey(keyName, region, function(err) {
        if(err) {
            console.log('Error deleting key "' + keyName  +  '": ' + err);
        }
    });
    cloudServices.terminateSimulator(machineInfo, function(err, info) {
        if(err) {
            res.jsonp(500, { error: err });
        } else {
            simulation.state = 'Terminated';
            simulation.date_term = Date.now();
            simulation.save(function(err) {
                if (err) {
                    return res.send('users/signup', {
                        errors: err.errors,
                        Simulation: simulation
                    });
                } else {
                    console.log('Simulator terminated: ' + util.inspect(info) + ' key: ' + keyName);
                    res.jsonp(simulation);
                    sockets.getUserSockets().notifyUser(req.user.id,
                                                        'simulation_terminate',
                                                        {data:simulation});
                }
            });
        }
    });
};

/////////////////////////////////////////////////
/// Show an simulation.
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.show = function(req, res) {
    res.jsonp(req.simulation);
};

/////////////////////////////////////////////////
/// List of simulations for a user.
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Function to get all simulation instances for a user.
exports.all = function(req, res) {
    var filter = {user: req.user};
    if (req.query.state) {
        var queryStates = req.query.state.split(',');
        filter.state = {$in : queryStates};
    }
    // Get all simulation models, in creation order, for a user
    Simulation.find(filter).sort().populate('user', 'name username')
      .exec(function(err, simulations) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(simulations);
        }
    });
};

//////////////////////////////////////////
// creates a zip file for the simulator
// @param simulation the simulation data
// @param cb the async callback (with possible err)
//
// first, create a directory, then save files inside
// and call external zip tool (because node libraries
// for creating zip file do not handle file modes
// correctly [yet?]: adm-zip, archiver, zipper, zlib)
function createSimulatorZipFile (simulation, cb) {
    var simId = simulation.sim_id;
    var keyStr = simulation.ssh_private_key;
    var ip = simulation.machine_ip;

    var dirPath = config.downloadsDir + '/' + simulation._id;
    console.log('k: ' + keyStr);
    console.log('ip: ' + ip);
    fs.mkdir(dirPath, function(err) {
        if (err) {
            cb(err);
        }else {
            var sshStr = '#!/bin/bash\n\n';
            sshStr += 'DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"\n\n';
            sshStr += 'ssh -i $DIR/key_sim_' + simId + '.pem ubuntu@' + ip + '\n';
            sshStr += '\n';
            // create the ssh log in script, make it executable
            var sshFile = 'ssh_sim_' + simId + '.bash';
            fs.writeFile(dirPath + '/' + sshFile, sshStr, {mode: 509}, function(err) {
                if(err) {
                    cb('Error creating ssh script');
                } else {
                    // now create the key file, with 0600 permissions
                    var keyFile = 'key_sim_' + simId + '.pem';
                    fs.writeFile(dirPath + '/' + keyFile, keyStr, {mode: 384}, function(err) {
                        if (err) {
                            cb('Error creating key file');
                        } else {
                            // files are saved, now zip
                            var cmd = 'zip ../' + simulation._id + '.zip ' + sshFile + ' ' + keyFile;
                            child_process.exec(cmd, { cwd: dirPath}, function(error, stdout, stderr) {                        
                                if(error){
                                     console.log('Error zipping. stdout: ' + stdout + '\nstderr: ' + stderr);
                                     cb(error);
                                }
                                // now... let'ss clean up after ourselves
                                // directory must be empty to be removed (a POSIX rule)
                                // so we delete each file first, starting with the key
                                fs.unlink(dirPath + '/' + keyFile, function (err) {
                                    if(err) {
                                        console.log('Error deleting key file: ' + keyFile + ' :' + err);
                                        cb(err);
                                    } else {
                                        // now delete the ssh script
                                        fs.unlink(dirPath + '/' + sshFile, function (err) {
                                            if(err) {
                                                console.log('Error deleting ssh script file: ' + sshFile + ' :' + err);
                                                cb(err);
                                            } else {
                                                // erase the directory
                                                fs.rmdir(dirPath, function(err) {
                                                    if(err) {
                                                        console.log('Error deleting directory "' + dirPath + '": ' + err);
                                                        cb(err); 
                                                    } else {
                                                        // success (files created, zip created, files and directory removed)
                                                        cb();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });         
        }
    }); 
}


//////////////////////////////////////////////////////
// private utility function to download
// a single file. Used for keyz.zip
// @param path the path of the local file to download
// 
function downloadFile(path, res) {

    fs.stat(path, function(err, stat) {
        if(err) {
            if('ENOENT' === err.code) {
                res.statusCode = 404;
                res.end('Not Found');
            }   
        } else {
            console.log('HEADERS!!');
            res.setHeader('Content-Length', stat.size);
            var stream = fs.createReadStream(path);
            stream.pipe(res);
            stream.on('error', function() {
                res.statusCode = 500;
                res.end('Internal Server Error');
            });
            stream.on('end', function() {
                res.end();
            });
        }
    });
}

////////////////////////////////////////////////////
// Downloads a zip file that contains the 
// ssh key for the simulator and a bash script
// to help you connect. The file is first created
// if it doesn't already exist in the directory
// (by defautl, /tmp/cloudsimk). The name of the zip
// file on the server is the _id of the simulator, a
// unique number that is generated by mongo
// @param req request
// @param res response
exports.keysDownload = function(req, res) {
    
    console.log('Keys download for sim ' + req.simulation.sim_id);  
    var path = config.downloadsDir + '/' + req.simulation._id + '.zip';
    console.log(path);    
     
    // write to tmp file
    // serve file
    fs.stat(path, function(err) {
        if(err) {
            if('ENOENT' === err.code) {
                // file does not exist
                createSimulatorZipFile(req.simulation, function(err) {
                    if(err) {
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                    } else {
                        // fresh new file is created, download it
                        console.log(path + ' created');
                        downloadFile(path, res);
                    }
                });
            }
            else {
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        } else {
            // file is there already, download it
            downloadFile(path, res);
        }
    });
};
