'use strict';

var ssh2 = require('ssh2');

//////////////////////////////////////////////////////////////////
// executes an ssh command on a server. This is used internally
// by the exported functions of this module 
function executeSshCommand(hostIp, sshPrivateKeyStr, cmd, cb) {
    // determine if we are performing the ssh calls for real or
    // if we are simply executing local tests.
    var fake = typeof(process.env.AWS_ACCESS_KEY_ID) === 'undefined';
    if(fake){
        console.log('FAKE ssh: ' + cmd);
        cb(null, {status:'Running'});
        return;
    }

    var c = new ssh2();
    // subscribe to connection events ready and error
    // (also avail: end, close)
    c.on('ready', function() {
        var output = '';
        c.exec(cmd, function(err, stream) {
            if (err) {
                // console.log('xx err:' + err);
                throw err;
            }
            // here we subscribe to various stream events, data
            // and exit. Also available: end, close ...
            // note: data has an extra param (extended) for the stream
            // stderr...
            stream.on('data', function(data) {
                stream += data;
            });
            stream.on('exit', function(code, signal) {
                c.end();
                var result = {code: code, output: output};
                if (signal) result.signal = signal;
                cb(null, result);
            });
        });
    });

    c.on('error', function(err) {
        cb(err);
    });
    // do it!
    c.connect({
        host: hostIp,
        port: 22,
        username: 'ubuntu',
        privateKey: sshPrivateKeyStr
    });
}

////////////////////////////////////////////////////////////////////////////
//  Start a simulation on a Gazebo server, stopping any running simulation
//  beforehand.
//  @param hostIp the ip address of the the server in xx.xx.xx.xx format
//  @param sshPrivateKey the content of the private key for the ubuntu user
//  @param world the world name to simulate (not a file path)
//  @param cb the callback (err, result) where result is a dict that contains a
//  code (for the process return code) and and output (gztopic output).
exports.startSimulation = function(hostIp, sshPrivateKeyStr, world, cb) {
    var cmd = 'cloudsimi/start_sim.bash ' + world;
    executeSshCommand(hostIp, sshPrivateKeyStr, cmd, cb);
};

////////////////////////////////////////////////////////////////////////////
//  Stops a simulation on a Gazebo server.
//  @param hostIp the ip address of the the server in xx.xx.xx.xx format
//  @param sshPrivateKey the content of the private key for the ubuntu user
//  @param cb the callback (err, result) where result is a dict that contains a
//  code (for the process return code) and and output (gztopic output).
exports.stopSimulation = function(hostIp, sshPrivateKeyStr, cb) {
    var cmd = 'cloudsimi/stop_sim.bash ';
    executeSshCommand(hostIp, sshPrivateKeyStr, cmd, cb);
};

////////////////////////////////////////////////////////////////////////////
//  Gets the running state of a simulator by running gztopic list on the
//  server.
//  @param hostIp the ip address of the the server in xx.xx.xx.xx format
//  @param sshPrivateKey the content of the private key for the ubuntu user
//  @param cb the callback (err, result) where result is a dict that contains a
//  code (for the process return code) and output (output of start_sim.bash).
exports.getSimulatorStatus = function(hostIp, sshPrivateKeyStr, cb) {
    var cmd = 'cloudsimi/ping_gazebo.bash';
    executeSshCommand(hostIp, sshPrivateKeyStr, cmd, cb);
};

//////////////////////////////////////////////////////////////////////////////
// Sends a public ssh key to a simulation server, by adding a line in the 
// /home/ubuntu/.ssh/authorized_keys file
// @param hostIp simulator ip
// @param sshPrivateKey  the content of the private key for the ubuntu user
// @param publicKeyStr  the content of the public key to upload
exports.uploadPublicKey = function(hostIp, sshPrivateKeyStr, publicKeyStr, cb) {
    var cmd =  'echo ' + publicKeyStr + '  >> .ssh/authorized_keys && echo "Key copied"' ;
    executeSshCommand(hostIp, sshPrivateKeyStr, cmd, cb);
};





