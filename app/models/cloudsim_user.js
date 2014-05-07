'use strict';

// @module cloudsim_user 
// The schema, validation, and static functions for CloudSim specific user
// information

// module dependencies
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


// Schema definition
var CloudSimUserSchema = new Schema({

    // the user that owns the information
    user :  {
        type: Schema.ObjectId,
        ref: 'User'
    },

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


//
// Statics
//
CloudSimUserSchema.statics.incrementNextSimId = function(userId, cb) {
    this.findOneAndUpdate( {user: userId},
                           {$inc:{next_sim_id: 1}},
                           function(err, cloudsimUser) {
                                if(err) {
                                    cb(err);
                                } else {
                                    cb(null, cloudsimUser.next_sim_id);
                                }
                           });
};

mongoose.model('CloudsimUser', CloudSimUserSchema);

