'use strict';

var mongoose = require('mongoose'),
    CloudsimUser = mongoose.model('CloudsimUser');

var sshServices = require('../lib/ssh_services.js');


//////////////////////////////////////////////////////////////////////////////
/// Uses ssh to connect to a simulation and upload all the ssh keys from a
/// user to the ubuntu user.
/// @param sim the simulator document in the db simulations collection
/// @userId the _id of the user in the users collection
/// @cb a callback function with an err (error) and the uploaded keys
exports.uploadAllUserKeysToSimulator = function(sim, userId, cb) {
    var hostIp = sim.machine_ip;
    var sshPrivateKeyStr = sim.ssh_private_key;
   CloudsimUser.findFromUserId (userId, function(err, csUser) {
        if(err) {
            console.error('uploadUserKeys: error looking up user data: ' + err);
            cb(err);
 console.log('2 KJHKHJKJH !!!');
       } else {
 console.log('1.1 KJHKHJKJH !!! keys: ' +  csUser.public_ssh_keys.length);

            var publicKeyStrArray = [];
            for(var i=0; i < csUser.public_ssh_keys.length; i++) {
 console.log('222 3 KJHKHJKJH !!!');    
                var k = csUser.public_ssh_keys[i].key;
                publicKeyStrArray.push(k);
 console.log('3 KJHKHJKJH !!!');
           }
            sshServices.uploadPublicKeys(hostIp, sshPrivateKeyStr, publicKeyStrArray, function(err, result) {
                if(err) {
                    console.log('uploadAllUserKeysToSimulator error:' + err);
                    cb(err);
                } else {
                    cb(null, result);
 console.log('4 KJHKHJKJH !!!');
               }
            });
        }
    });
};


//////////////////////////////////////////////////////////////////////////////
///
/// @param req the request
/// @param res the response
exports.share = function(req, res) {
    var result = {};
    res.jsonp(result);
};

