var ssh2 = require('ssh2');

var fake = typeof(process.env.AWS_ACCESS_KEY) == 'undefined'

exports.getSimulatorStatus = function(hostIp, sshPrivateKeyStr, cb) {
    console.log('PING_GAZEBO!!! ' + hostIp);
    if(fake) cb(null, {status:'Running'});
    // error

//    cb('can\'t');
//    cb(null, false);
//    cb(null, true);

    var c = new Connection();
    c.on('ready', function() {
        console.log('Connection :: ready');
        c.exec('cloudsimi/ping_gazebo.bash', function(err, stream) {
            if (err) throw err;
                stream.on('data', function(data, extended) {
                    console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ') + data);
                });
            stream.on('end', function() {
                console.log('Stream :: EOF');
            });
            stream.on('close', function() {
                console.log('Stream :: close');
            });
            stream.on('exit', function(code, signal) {
                console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
                c.end();
            });
        });
    });

    c.on('error', function(err) {
    console.log('Connection :: error :: ' + err);
    });

    c.on('end', function() {
        console.log('Connection :: end');
    });
    c.on('close', function(had_error) {
        console.log('Connection :: close');
    });

    c.connect({
        host: ip,
        port: 22,
        username: 'ubuntu',
        privateKey: sshPrivateKeyStr // require('fs').readFileSync('/here/is/my/key')
    });


};

