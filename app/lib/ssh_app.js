'use strict';

var sshServices = require('../lib/ssh_services.js');
var fs = require('fs');

console.log(process.argv);
if (process.argv.length === 2) {
    console.log('node ssh_services keyfile ip stat');
    console.log('node ssh_services keyfile ip start worldfile');
    console.log('node ssh_services keyfile ip stop');
    console.log('node ssh_servides keyfile ip sendkey publicKeyfile');
    console.log('');
    process.exit(); 
}

var keyPath = process.argv[2];
var ip = process.argv[3];
var cmd = process.argv[4];

console.log('key: ' + keyPath);
console.log('ip: ' + ip);
console.log('cmd: ' + cmd);

var key = fs.readFileSync(keyPath);
console.log('key:\n' + key + '\n');

if( cmd === 'stat') {
    sshServices.getSimulatorStatus(ip, key, function(err, result ){
        if(err) console.log('Simulator not working ' + ip + ' error: ' + err);
        else console.log(result);
    });
}

if (cmd === 'start') {
    var worldFile = process.argv[5];
    console.log('world: ' + worldFile);
    sshServices.startSimulation(ip, key, worldFile, function(err, result) {
        if(err) console.log('Error starting simulation on ' + ip + ': ' + err);
        else console.log(result);
    });
}

if (cmd === 'stop') {
    sshServices.stopSimulation(ip, key, function(err, result) {
        if(err) console.log('Error stopping simulation on ' + ip + ': ' + err);
        else console.log(result);
    });
}

if (cmd === 'sendkey') {
    console.log('sending public key ');
    var publicKeyPath = process.argv[5];

    var pubKey = fs.readFileSync(publicKeyPath);
    console.log('public key: ' + pubKey);
    sshServices.uploadPublicKey(ip, key, pubKey, function(err, result) {
        if(err) console.log('Error sending public ssh key to ' + ip + ': ' + err);
        else console.log(result);
    });
}


