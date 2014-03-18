'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Simulation Schema
 */
var SimulationSchema = new Schema({

    date_launch: {
        type: Date,
        default: Date.now
    },

    date_term: {
        type: Date,
        default: null
    },
    
    // human readable simulation id (starts at 0)
    sim_id: {
        type: String, // number
        default: 0
    },

    world: {
        type: String,
        default: ''
    },

    region: {
        type: String,
        default: ''
    },

    state: {
        type: String,
        default: 'Launching'
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }

   // server cost per hr (nb)
   
});

/**
 * Validations
 */
SimulationSchema.path('world').validate(function(s) {
    return s.length;
}, 'World cannot be blank');

SimulationSchema.path('region').validate(function(s) {
    return s.length;
}, 'Region cannot be blank');

/**
 * Statics
 */
SimulationSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};

mongoose.model('Simulation', SimulationSchema);
