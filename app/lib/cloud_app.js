var cloud_services = require('cloud_services');


// this is a cmd line app to exercise the cloud_services module,
// since it is not tested.
//
// you must have the following environment variables setup:
// AWS_SECRET_ACCESS_KEY
// AWS_ACCESS_KEY_ID 
//
// examples: 
// 1) launch a simulator machine
// node cloud_app.js launch region keyname : this will launch a
// simulator in the specified region. The keyname refers
// to an existing key in this AWS regiom
// 2) get the ip and status of  a simulator machine
// node cloud_app stat id region
// 3) terminate a simulator machine
// node cloud_app.js term 



var sim_id = 'sim_0';
var username = 'test@test.com';
var keyName = 'cs-test@test.com';
var image = 'ami-b8d2b088';
var hardware = 'g2.2xlarge';


var cmd = process.argv[2];

console.log('cmd: ' + cmd);

if (cmd == 'launch') {
    region = process.argv[3];
    console.log('region: ' + region);
    keyName = process.argv[4];
    console.log('keyName: ' + keyName;

    cloud_services.launchSimulator(username, keyName, sim_id, region, hardware, image, function (err, machineInfo) {
        if(err) {
            console.log('my callback err: ' + err);
        } else {
            console.log('machineInfo: ' + util.inspect(machineInfo));
        }
    });
}

if (cmd == 'stat') {
    var instance = process.argv[3];
    var region = process.argv[4];

    console.log('instance: ' + instance);
    console.log('region:' + region);

    simulatorStatus({id: instance, region: region}, function(err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}

if (cmd == 'term') {
    var instance = process.argv[3];
    var region = process.argv[4];

    console.log('instance: ' + instance);
    console.log('region:' + region);

    cloud_services.terminateSimulator({id: instance, region: region}, function(err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}

if (cmd == 'key') {
    username = process.argv[3];
    console.log('username: ' + username);
    path = process.argv[4];
    console.log('path: ' + path);
    region = process.argv[5];
    console.log('region: ' + region);

    cloud_services.setupPublicKey(username, region, function (err, info) {
       if (err) console.log('err: ' + err);
       else console.log('info: ' + info);
    });
}

