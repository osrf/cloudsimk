/*
LIST

curl -u testUser:testPass http://localhost:3000/api/simulations

CREATE
curl  -u testUser:testPass -H 'Content-Type: application/json' -H 'Accept: application/json' -X POST -d '{"world":"empty world","region":"Oregon"}' http://localhost:3000/api/simulations

READ
curl -u testUser:testPass http://localhost:3000/api/simulations/sim_1

UPDATE
curl -u testUser:testPass -H 'Content-Type: application/json' -H 'Accept: application/json' -X PUT -d '{"world":"End of the world","region":"Oregon"}' http://localhost:3000/simulations/api/sim_1

DELETE
curl -u testUser:testPass -X DELETE http://localhost:3000/simulations/api/sim_1


HISTORY
curl -u testUser:testPass http://localhost:3000/api/history

*/

'use strict';

var path = require('path');
var mime = require('mime');
var fs = require('fs');

var db = require('../lib/sim_db');
var db_name = "db_" +  process.argv[2];

console.log("Database name:  " + db_name);
db.connect(db_name);

// clear the database if instructed
if (process.argv[3] === "--clear_db") {
    db.clear_db(function () {});
}

// internal function that
// returns a database connection
// for the logged on user
function get_db(req) {
    var user = "test_user",
        my_db = new db.sim_db(user);
    return my_db;
}

// REST API cRud for simulations collection
// returns the list of simulations for the current user.
function read(req, res)
{
    var my_db = get_db(req); 
    my_db.get_running_simulations(function (err, sims) {
        console.log("results: " + list.length);
        res.json(sims);
    });
}

// REST API Crud for simulations collection
// launches a new machine in a specified region
// and starts a new simulation of a specified world
function create(req, res)
{
   var my_db = get_db(req);
   my_db.create_sim(req.body["world"], req.body["region"], function (err, sim) {
       res.json(sim);
   });
}

// REST API crUd for simulations collection
// change the simulation world
function update(req, res)
{
    var id = req.params.id;
    var data = req.body;
    console.log(JSON.stringify(data));
    var world = data["world"];    
    var my_db = get_db(req);    

    my_db.change_world(id, world, function (err, sim) {
        res.json(sim);
    });
}   

// REST API cruD for simulations collection
// terminates a simulation by setting its 
// state to terminated
function del(req, res)
{
    var my_db = get_db(req);
    var id = req.params.id;
    
    my_db.terminate_sim(id, function (err, changed_sim) {     
        res.json(changed_sim);
    });
}

// REST API: url to get the zip files for a simulation server
function download_keys(req, res)
{
    var file = __dirname + '/keys/keys.zip';
    console.log("Downloading " + file);

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);
    
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);	
}

exports.create = create;
exports.update = update;
exports.read = read;
exports.del = del;
exports.download_keys = download_keys;

