
// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var util = require('util');


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
            cb("runInstance err: " +  err);
        } else {
            if(data.Instances[0]) {
                // console.log("data.instances[0]:  " + util.inspect(data.Instances[0]));

                var machineInfo = { id: data.Instances[0].InstanceId,
                                    region: region
                                //ip: data.Instaces[0].ip
                              }
                };
                params = {Resources: [machineInfo.id], Tags: [
                    {Key: 'Name', Value: 'simulator'},
                    {Key: 'user', Value: username},
                    {Key: 'id', Value: simId}
                ]};
                ec2.createTags(params, function(err) {
                    console.log("Tagging instance", err ? "failure" : "success");
                    if (err) {
                        cb(err);
                    }
                    else {

                        cb(null, machineInfo);
                    }
                });
            }
        });

};


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


exports.setupPublicKey = function (username, region, cb) {
    var params = {
         KeyName: 'cs-' + username, // required
         PublicKeyMaterial: 'BASE64_ENCODED_STRING', // required
         DryRun: false
    }
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




















