'use strict';

// Load the SDK and UUID
var AWS = require('aws-sdk');
var util = require('util');


// Async functions to launch machines on a cloud provider
// AWS is the only supported one for now

/////////////////////////////////////////////////////////////
// Launch a simulator machine, given:
// a username (for info on the AWS console)
// a public ssh key name (must exist on AWS for that region)
// a simulation id (for info on the AWS console) 
// a hardware type
// an AMI (image id registered in that region)
// a call back function
exports.launchSimulator = function (username, keyName, simId, region, hardware, image, cb) {

    // set AWS region
    AWS.config.region = region;

    var awsParams = {
        KeyName: keyName,
        ImageId: image,
        InstanceType: hardware,
        MinCount:1,
        MaxCount: 1
    };
    var ec2 = new AWS.EC2();
    ec2.runInstances(awsParams, function (err, data) {

        if(err) {
            cb(err);
        }
        else {
            if(data.Instances[0]) {
                // console.log("data.instances[0]:  " + util.inspect(data.Instances[0]));

                var machineInfo = { id: data.Instances[0].InstanceId,
                                    region: region
                                //ip: data.Instaces[0].ip
                              };
                var params = {Resources: [machineInfo.id], Tags: [
                    {Key: 'Name', Value: 'simulator'},
                    {Key: 'user', Value: username},
                    {Key: 'id', Value: simId}
                ]};
                ec2.createTags(params, function(err) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        cb(null, machineInfo);
                    }
                });
            }
        }
    });
};



/////////////////////////////////////////////////////////
//
// Get the ip address and status of a simulator machine
// machineInfo must contain:
//      id: the AWS instance id
//      region: the AWS region where the machine exists      
exports.simulatorStatus = function (machineInfo, cb) {
    var params = {
        DryRun: false,
        Filters: [],
        InstanceIds: [machineInfo.id]
    };
    AWS.config.region = machineInfo.region;
    var ec2 = new AWS.EC2();
    ec2.describeInstances(params, function(err, data) {
        if (err) {
            cb(err);
        }
        else {
            var instance = data.Reservations[0].Instances[0];
            var info = {
                ip: instance.PublicIpAddress,
                state: instance.State.Name
            };
            cb(null, info);
        }
    });
};


////////////////////////////////////////////////////
//
// Terminates a simulator machine.
// machineInfo must constain:
//       id: the AWS instance id
//       region: the region where the machine exists
exports.terminateSimulator = function (machineInfo, cb) {
    var params = {
        InstanceIds: [ machineInfo.id],
        DryRun: false
    };
    AWS.config.region = machineInfo.region;
    var ec2 = new AWS.EC2();
    ec2.terminateInstances(params, function(err, data) {
        if (err) {
            // console.log('terminate err: ' + err, err.stack); // an error occurred
            cb(err);
        } else  {
            // console.log('terminate data: ' + util.inspect(data));
            var info = data.TerminatingInstances[0].CurrentState;
            cb(null, info);
        }
    });
};


//////////////////////////////////////////////////////
//
// Uploads a public ssh key to a specific AWS region
// The key name on AWS is 'cs-' + the specified username 
exports.setupPublicKey = function (username, region, cb) {
    var params = {
        KeyName: 'cs-' + username, // required
        PublicKeyMaterial: 'BASE64_ENCODED_STRING', // required
        DryRun: false
    };
    AWS.config.region = region;
    var ec2 = new AWS.EC2();
    ec2.importKeyPair(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            cb(err);
        }
        else {
            console.log(util.inspect(data));           // successful response
            var info = data;
            cb(null, info);
        }
    });
};





















