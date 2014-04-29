'use strict';

var mongoose = require('mongoose'),
    Simulation = mongoose.model('Simulation');
var sshServices = require('../lib/ssh_services.js');
var sockets = require('../lib/sockets');

//////////////////////////////////////////////////////////////////////////////
// this controller handles the callback that each simulator server performs
// to signal CloudSim that it is ready. 
exports.simulatorCallback = function (req, res) {
    console.log('simulatorCallback data:' + require('util').inspect(req.body));
    var token = req.body.token;    
    Simulation.find({secret_token: token}).exec(function(err, simulations) {
        if(err) {
            var msg = 'simulator callback error: error looking for simulator token: ' + err;
            console.log(msg);
            res.jsonp({result: 'Error', message: msg});
        } else {
            if(simulations.length === 1 ) {
                var sim = simulations[0];
                sshServices.getSimulatorStatus(sim.machine_ip, sim.ssh_private_key, function (err, result){
                    if(err) {
                        var msg = 'error communicating with simulator: ' + err;
                        console.log(msg);
                        res.jsonp({result: 'Error', message: msg});
                    } else {
                        if(result.code !== 0) {
                            // gztopic returned an error, sim is not running
                            sim.state = 'Error';
                            var s = 'Error getting simulation status for sim';
                            s +=  ' ' + sim._id + ': ' + result.output;
                            console.log(s);
                        } else {
                            // gztopic success... set the new state
                            sim.state = 'Running';
                        }
                        // save simulation state
                        sim.save(function(err) {
                            if(err) {
                                var msg = 'Error saving sim: ' + err;
                                console.log(msg);
                                // db error? possible, but unlikely
                                res.jsonp({result: 'Error', message: msg});
                            } else {
                                // success: simulator found, status updated
                                res.jsonp({result: 'OK', message: 'Update successful' });
                                // let all the other browser windows know
                                sockets.getUserSockets().notifyUser(sim.user,
                                                                    'simulation_update',
                                                                    {data:sim});

                            }
                        });
                    }                  
                });
            } else {
                // token is not associated with a simulator. An attack? A callback to the wrong address?
                res.jsonp({result: 'Error', message: 'Can\'t find simulator for callback token: ' + token});
            }
        }
    });
};

