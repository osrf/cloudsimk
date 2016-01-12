"use strict"


let xcloud = require('./cloud_services.js')
let process = require('process')
//
//  Don't forget to load the AWS credentials in the environment
//
if( !process.env.AWS_ACCESS_KEY_ID) {
  console.log('AWS credentials not found!')
  process.exit(-1)
}

let trusty = { desc: 'Trusty 14.04 base image',
               region : 'us-west-1',
               keyName : 'hugo_osrf',
               hardware : 'g2.2xlarge',
               security : 'gazebo',
               image : 'ami-df6a8b9b'} // plain Trusty

let rabbit = { desc: 'Nvidia: http://tleyden.github.io/blog',
               region : 'us-east-1',
               keyName : 'hugo_osrf',
               hardware : 'g2.2xlarge',
               security : 'gazebo',
               image : 'ami-2cbf3e44'} // nvidia base

let base_bad = { desc: 'BAD: Trusty + latest nvidia',
               region : 'us-west-1',
               keyName : 'hugo_osrf',
               hardware : 'g2.2xlarge',
               security : 'gazebo',
               image : 'ami-4f09c90b'} // nvidia base

let base_good = { desc: 'Trusty + nvidia (CUDA 6.5)',
               region : 'us-west-1',
               keyName : 'hugo_osrf',
               hardware : 'g2.2xlarge',
               security : 'gazebo',
               image : 'ami-ea9af68a'}

let m  = base_good
console.log( m.desc)
console.log('region: ' + m.region)

let info = {}

let script = `


cd /home/ubuntu/code/src_cloud_simulator
echo 'SCRIPTO BEGIN' > log.txt
date >> log.txt

hg revert -a
hg pull -u

echo "hg pull -u of branch" >> log.txt
hg branch >> log.txt
date >> log.txt

echo "setup..." >> log.txt
date >> log.txt
./aws_setup_aws.bash

#echo "reboot" >> log.txt
date >> log.txt
#reboot
`

let tags = {Name:'simtest'}

xcloud.launchSimulator (m.region, m.keyName, m.hardware, m.security, m.image, tags, script,
  function (err, machine) {
    if (err) throw err
    info = machine
    console.log('machine: ' + info.id)
    setTimeout(
      function ()
      {
        xcloud.simulatorStatus(info, console.log)
      }
    , 10000)
  }
)
