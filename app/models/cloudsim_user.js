'use strict';

// @module cloudsim_user 
// The schema, validation, and static functions for CloudSim specific user
// information

// module dependencies
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// Schema definition
var CloudSimUserSchema = new Schema({

    // The ID of the next simulation instance the user will run
    next_sim_id: {
        type: Number,
        default: 0
    }

});

//
// Validations
//
CloudSimUserSchema.path('next_sim_id').validate(function(s) {
    return s >= 0;
}, 'next id must be positive');

