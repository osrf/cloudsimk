'use strict';

var mongoose = require('mongoose'),
    Simulation = mongoose.model('Simulation');
var sshServices = require('../lib/ssh_services.js');

//////////////////////////////////////////////////////////////////////////////
// this controller handles the callback that each simulator server performs
// to signal CloudSim that it is ready, or . 
exports.simulatorCallback = function (req, res) {
    //console.log('  query:' + require('util').inspect(req.body));
    var token = req.body.token;    
    console.log('TOKEN: ' + token);
    Simulation.find({secret_token: token}).exec(function(err, simulations) {
        if(err) {
            var msg = 'simulator callback error: error looking for simulator token: ' + err;
            console.log(msg);
            res.jsonp({result: 'Error', message: msg});
        } else {
            if(simulations.length == 1 ) {
                var sim = simulations[0];
                sshServices.getSimulatorStatus(sim.machine_ip, sim.ssh_private_key, function (err, info){
                    if(err) {
                        var msg = 'error communicating with simulator: ' + err;
                        console.log(msg);
                        res.jsonp({result: 'Error', message: msg});
                    } else {
                        console.log('SIM: ' + require('util').inspect(sim));
                        sim.state = 'Error';
                        sim.state = 'Running';
                        // save simulation state
                        sim.save(function(err) {
                            if(err) {
                                var msg = 'Error saving sim: ' + err;
                                console.log(msg);
                                res.jsonp({result: 'Error', message: msg});
                            } else {
                                // 
                                res.jsonp({result: 'OK', message: 'Update successful' });
                            }
                        });
                    }                  
                });
            } else {
                console.log('SIM:' + require('util').inspect(sim));
                var msg = 'token "' + token  + '" not found';
                res.jsonp({result: 'Error', message: msg});
            }
        }
    });
//    var resp = {result: 'OK'};
//    res.jsonp(resp);
};

