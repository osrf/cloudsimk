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
        default: -1
    },

    credit: {
      type: Number,
      default: 0
    },

    invites: {
      type: Number,
      default: 0
    },

    admin: {
      type: Boolean,
      default: false
    },

    public_ssh_keys: [
        {
            // a name to identify the key
            label: String,
            // the key data
            key: String,
            // the date when the key was added
            date: Date
        }
    ]
});

//
// Validations
//
CloudSimUserSchema.path('next_sim_id').validate(function(s) {
    return s >= -1;
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
                                    if(cloudsimUser) {
                                        cb(null, cloudsimUser.next_sim_id);
                                    } else {
                                        cb('Can\'t find CloudSim information for the user');
                                    }
                                }
                           });
};


//
//  Return the cloudsimUser that corresponds to a user
//  @param userId the id of the user in the users collection
//  @cb callback with 2 parameters (error, cloudsimUser)
CloudSimUserSchema.statics.findFromUserId = function(userId, cb) {
    this.findOne(   {user: userId},
                    function(err, cloudsimUser) {
                        if(err) {
                            cb(err);
                        } else {
                            cb(null, cloudsimUser);
                        } 
                    });
};


mongoose.model('CloudsimUser', CloudSimUserSchema);

