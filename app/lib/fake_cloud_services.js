'use strict';

console.log('*');
console.log('* THIS IS THE FAKE CLOUD SERVICE....');
console.log('*');


exports.launchSimulator = function (username, keyName, simId, region, hardware, image, cb) {

    var machineInfo = { id: 'x-424242',
                        region: 'us-east-1'
                      };

    cb(null, machineInfo);
};

exports.simulatorStatus = function (machineInfo, cb) {
    cb(null, {ip:'1.1.1.1', state:'running'});
};

exports.terminateSimulator = function (machineInfo, cb) {
    cb(null, 'shutting-down');
};

