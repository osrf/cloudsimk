"use strict";

var mongoose = require('mongoose');

var TERMINATED = "terminated";

var db; // the connection to the database
var next_id = 1;

// Computes the next sim_id for a given user
// this will evolve, once we have a user document
function get_new_sim_id(user_name, cb) {
    var sim_id = "sim_" + next_id;
    next_id = next_id + 1;
    console.log('sim_id: ' + sim_id + ' for ' + user_name);
    cb(null, sim_id);
}

// The schema for the simulation
var Sims = new mongoose.Schema({
    sim_id: String,
    user: String,
    world: String,
    region: String,
    date_launch: String,
    date_term: String,
    state: String,
});

Sims.method('isTerminated', function () {
    return this.state === TERMINATED;
});

mongoose.model('Sim', Sims);
var Sim = mongoose.model('Sim');

// The simulation database interface. This is used by the REST API to
// store data in Mongodb. Each instance is initialized with a user.
function sim_db(user) {
    this.user = user;   // the user that can start/stop the simulation

    // returns the list of running simulations for the current user
    this.get_running_simulations = function (cb) {
        Sim.find({'user': this.user, state: {$ne: TERMINATED } }, function (err, sims) {
            cb(err, sims);
        });
    };

    // returns the list of terminated simulations for the current user
    this.get_history = function (cb) {
        Sim.find({'user': this.user, state: TERMINATED }, function (err, sims) {
            console.log("get_history: " + sims.length + " results");
            cb(err, sims);
        });
    };

    // deletes a terminated sim from the database
    this.remove_from_history = function (id, cb) {
        this.find_simulation(id, function (err, sim) {
            if (sim.isTerminated()) {
                sim.remove();
                cb(err, sim);
            }
        });
    };

    // creates a new simulation entry in the database, and sets the state to
    // launching
    this.create_sim = function (world, region,  cb) {
        get_new_sim_id(user, function (err, new_sim_id) {
            var sim = new Sim();
            sim.world = world;
            sim.region = region;
            sim.user = user;
            sim.date_launch = "";
            sim.date_term = "";
            sim.state = "launch";
            sim.sim_id = new_sim_id;
            sim.save(function (err) {
                cb(err, sim);
            });
        });
    };

    // change the simulation world
    this.change_world = function (sim_id, new_world, cb) {
        var query = {user: this.user, sim_id: sim_id};
        Sim.findOne(query,  function (err, doc) {
            doc.world = new_world;
            doc.save(function (err) {
                cb(err, doc);
            });
        });
    };

    // updates the state of the simulation with a new value
    // values are: launching, running and terminated
    this.change_state = function (sim_id, new_state, cb) {
        var query = {user: this.user, sim_id: sim_id};
        Sim.findOne(query,  function (err, doc) {
            doc.state = new_state;
            doc.save(function (err) {
                cb(err, doc);
            });
        });
    };

    // terminates a simulation
    this.terminate_sim = function (sim_id, cb) {
        this.change_state(sim_id, TERMINATED, cb);
    };

    // find a simulation from its id
    this.find_simulation = function (sim_id, cb) {
        Sim.findOne(sim_id, function (err, doc) {
            cb(err, doc);
        });
    };
}

// connects to a database. A database name must
// be provided (i,i  server port number, or "test"). 
// this should be called once when the application starts
function connect(db_name) {
    var uri = 'mongodb://localhost/' + db_name;
    console.log("connecting to database: " + uri);
    db = mongoose.connect(uri);
}

// mongoose error handler. 
// Because of a bug in Mongoose, this handler must be present
// even if its empty.
mongoose.connection.on('error', function () {
    console.log("mongoose connection error!");
});

// erases all data in the current database. This function
// is only used for testing purposes.
function clear_db(cb) {
    console.log("clear_db: ");
    next_id = 1;
    Sim.remove({}, function (err) {
        console.log("sims removed from db");
        cb(err);
    });
}

// the following structures are available for
// consumers of this module (via require)
exports.sim_db = sim_db;
exports.clear_db = clear_db;
exports.connect = connect;

