'use strict';

/// Module dependencies.
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mean-dev');

require('../models/user');
require('../models/simulation');

var User = mongoose.model('User'),
    Simulation = mongoose.model('Simulation');

var fs = require('fs');

console.log(process.argv + '\n\n');

var email = process.argv[2];
var simId = process.argv[3];
var keyF = process.argv[4];

console.log('email: ' + email);
console.log('simId' + simId);

console.log('Looking for user...');
User.find({email: email}).exec(function(err, users) {
    if(err)  console.log('ERR ' + err);
    else {
        var user = users[0];
        console.log(user);
        Simulation.find({user:user, sim_id: simId}).exec(function (err, sims) {
            if(err) console.log('ERR ' + err);
            else  {
                var sim = sims[0];
                //console.log(sim);
                var key = sim.ssh_private_key;
                fs.writeFile(keyF, key, function(err) {
                    if(err) console.log('Error saving key: ' + err);
                    else console.log(keyF + ' saved');
                });
            }
            if (sims.length === 0) console.log('Simulator not found');
        });
    }
    if(users.length === 0) console.log('User not found');
});

console.log('DONE');


