'use strict';

/// Module dependencies.
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mean-dev');

require('../models/user');
require('../models/simulation');

var User = mongoose.model('User'),
    Simulation = mongoose.model('Simulation');

var fs = require('fs');

if (process.argv.length < 4) {
    console.log('node key.js email simId keyFile');
    process.exit();
}
var email = process.argv[2];
var simId = process.argv[3];
var keyF = process.argv[4];

console.log('email: ' + email);
console.log('simId: ' + simId);

console.log('Looking for user ' + email);
User.find({email: email}).exec(function(err, users) {
    if(err)  console.log('ERR ' + err);
    if(users.length !==1) console.log('user ' + email + ' not found');
    else {
        var user = users[0];
        console.log(user);
        console.log('Looking for simulation ' + simId);
        Simulation.find({user:user, sim_id: simId}).exec(function (err, sims) {
            if(err) console.log('ERR ' + err);
            else  {
                if (sims.length === 0) console.log('Simulator not found');
                else {
                    var sim = sims[0];
                    var key = sim.ssh_private_key;
                    fs.writeFile(keyF, key, function(err) {
                        if(err) console.log('Error saving key: ' + err);
                        else console.log(keyF + ' saved');
                        process.exit();
                    });
                }
            }
        });
    }
});




