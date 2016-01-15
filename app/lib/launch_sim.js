"use strict"

let fs = require('fs')
let xcloud = require('./cloud_services.js')
let process = require('process')
//
//  Don't forget to load the AWS credentials in the environment
//
if( !process.env.AWS_ACCESS_KEY_ID) {
  console.log('AWS credentials not found!')
  process.exit(-1)
}

if (process.argv.length != 3) {
  console.log('Wrong # of arguments! script path expected')
  console.log('args: ', process.argv.length)
  process.argv.forEach((val, index, array) => {
    console.log(`${index}: ${val}`);
  });
  process.exit(-3)
}

let script = fs.readSync(process.argv[2], 'utf8')

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
