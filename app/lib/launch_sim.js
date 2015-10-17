"use strict"

let xcloud = require('./cloud_services.js')

let region = 'us-west-1'
let keyName = 'hugo_osrf'
let hardware = 'g2.2xlarge'
let security = 'gazebo'
let image = 'ami-df6a8b9b'
let info = {}

let script = 'echo "SCRIPTO DONE"'
let tags = {Name:'simtest'}

xcloud.launchSimulator (region, keyName, hardware, security, image, tags, script,
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
