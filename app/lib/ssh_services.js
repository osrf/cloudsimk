
var ssh2 = require('ssh2');

var fake = typeof(process.env.AWS_ACCESS_KEY_ID) == 'undefined'

exports.getSimulatorStatus = function(hostIp, sshPrivateKeyStr, cb) {
    console.log('PING_GAZEBO!!! ' + hostIp);
    if(fake){
        console.log('FAKE ssh');
        cb(null, {status:'Running'});
        return;
    }
    var cmd = 'cloudsimi/ping_gazebo.bash';
//    cmd = 'ls -l';
    var c = new ssh2();
    c.on('ready', function() {
        console.log('Connection :: ready');
        c.exec(cmd, function(err, stream) {
            if (err) {
                console.log('xx err:' + err);
                throw err;
            }
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
                if(code === 0) {
                    //
                    console.log('HONKY DORY!');
                    cb(null);
                } else {
                    //
                    console.log('ERROR TERROR');
                    cb('Error!!');
                }
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
        host: hostIp,
        port: 22,
        username: 'ubuntu',
        privateKey: sshPrivateKeyStr // require('fs').readFileSync('/here/is/my/key')
    });

    
};

