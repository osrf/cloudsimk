'use strict';

// @module simulation_model
// The schema, validation, and static functions for a simulation model.

// Module dependencies.

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// Simulation Schema

var SimulationSchema = new Schema({

    // The date and time on which the simulation instance was started
    date_launch: {
        type: Date,
        default: null
    },

    // The date and time on which the simulation instance was terminated
    date_term: {
        type: Date,
        default: null
    },

    // Simulation id (starts at 0). The user is not allowed to modify
    // this value
    sim_id: {
        type: Number, // number
        default: 0
    },

    // The name of the world file that was run
    world: {
        type: String,
        default: ''
    },

    // The region in which the simulation instance was run
    region: {
        type: String,
        default: ''
    },

    // Current state of the simulation instance
    state: {
        type: String,
        default: 'Launching'
    },

    // The user who launched the simulation instance.
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    // a cloud provider machine id (necessary for termination)
    // for AWS, this is the "instance id"
    machine_id: {
        type: String
    },

    // the ssh private key for this machine, in pem format
    ssh_private_key: {
        type: String
    },

    // ip address of the machine
    machine_ip: {
        type: String
    },

    // cost per hr
    server_price: {
        type: Number
    }


});


// Validations
SimulationSchema.path('date_launch').validate(function(s) {
    return s !== null;
}, 'Launch date must be set');

SimulationSchema.path('sim_id').validate(function(s) {
    return s >= 0;
}, 'Simulation id must be zero or positive.');

SimulationSchema.path('world').validate(function(s) {
    return s.length;
}, 'World cannot be blank');

SimulationSchema.path('region').validate(function(s) {
    return s.length;
}, 'Region cannot be blank');

SimulationSchema.path('state').validate(function(s) {
    return ['Launching', 'Terminated', 'Initializing'].indexOf(s) > -1 ;
}, 'State of the simulation instance must be Launching or Terminated');

SimulationSchema.path('user').validate(function(s) {
    return s !== null;
}, 'User must be set.');

/////////////////////////////////////////////////
// Statics
SimulationSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};

SimulationSchema.statics.loadBySimId = function(userId, simId, cb) {
    this.findOne({
        user: userId,
        sim_id: simId
    }).populate('user', 'name username').exec(cb);
};

mongoose.model('Simulation', SimulationSchema);
