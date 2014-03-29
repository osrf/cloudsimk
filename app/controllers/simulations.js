'use strict';
/// @module simulation_controller
/// Server side simulation controller.


/// Module dependencies.
var mongoose = require('mongoose'),
    Simulation = mongoose.model('Simulation'),
    User = mongoose.model('User'),
    _ = require('lodash');


var cloudServices;

if(process.env.AWS_ACCESS_KEY_ID) {
    console.log('using the real cloud services!');
    cloudServices = require('../lib/cloud_services.js');
} else {
    console.log('process.env.AWS_ACCESS_KEY_ID not defined: using the fake cloud services');
    cloudServices = require('../lib/fake_cloud_services.js');
}

var util = require('util');


var awsData = { 'US West': {region: 'us-west-2',
                            image: 'ami-cc95f8fc', // cloudsim // 'ami-b8d2b088',
                            hardware: 'm1.small',
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



/////////////////////////////////////////////////
/// Create a simulation
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Simulation create function.
exports.create = function(req, res) {

    // Create a new simulation instance based on the content of the
    // request
    console.log('create simulation request body: ' + util.inspect(req.body));
    var simulation = new Simulation(req.body);

    // Set the simulation user
    simulation.user = req.user;

    User.load(req.user.id, function(err, user) {

        simulation.sim_id = user.next_sim_id++;

        // we pick the appropriate machine based on the region specified
        // by the user
        var serverDetails = awsData[simulation.region];
     
        var keyName = 'cs-' + simulation.sim_id  + req.user.email;
        cloudservices.generateKey(keyName, serverDetails.region, function(err, key) {
            
            cloudServices.launchSimulator(  req.user.username,
                                            keyName,
                                            simulation.sim_id,
                                            serverDetails.region,
                                            serverDetails.hardware,
                                            serverDetails.image,
                                            function (err, machineInfo) {
                if(err) {
                    res.jsonp(500, { error: err });
                } else {
                    simulation.machine_id = machineInfo.id;
                    simulation.server_price = serverDetails.price;
                    simulation.machine_ip = 'N/A';
    
                    setTimeout(function () {
                        
                        simulation.machine_ip = 'waiting';
                        console.log('TIMED OUT ' + util.inspect(machineInfo));
                        cloudServices.simulatorStatus(machineInfo, function(err, state) {
                            console.log('got status: ' + util.inspect(state));
                            simulation.machine_ip = state.ip;
                            simulation.save(function(err) {
                                if (err) {
                                    if(machineInfo.id) {
                                        console.log('error saving simulation info to db: ' + err);
                                        console.log('Terminating server ' + machineInfo.id);
                                        cloudServices.terminateSimulator(machineInfo, function () {});
                                    }
                                    res.jsonp(500, { error: err });
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
                        } else {
                            user.save(function(err) {
                                if (err) {
                                    if(machineInfo.id) {
                                        console.log('error saving simulation info to db: ' + err);
                                        console.log('Terminating server ' + machineInfo.id);
                                        cloudServices.terminateSimulator(machineInfo, function () {});
                                    }
                                    return res.send('users/signup', {
                                        errors: err.errors,
                                        Simulation: simulation
                                    });
                                } else {
                                    res.jsonp(simulation);
                                }
                            });
                        }
                    });
                }
            });
        });
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

    /* Save the updated simulation to the database */
    simulation.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                Simulation: simulation
            });
        } else {
            res.jsonp(simulation);
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

    var machineInfo = {region: awsData[simulation.region].region,
                    id: simulation.machine_id};
    console.log('Cloud terminate: ' + util.inspect(machineInfo));
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
                    console.log('Simulator terminated: ' + info);
                    res.jsonp(simulation);
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
    Simulation.find(filter).sort('-date_launch').populate('user', 'name username')
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
