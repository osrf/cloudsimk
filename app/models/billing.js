'use strict';

/// Module dependencies
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    // util = require('util');

/// Billing Schema
var BillingSchema = new Schema({

    // The user who gets billed.
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },

    // this describes the billing operation
    // like account top up, simulation charge
    // (not sure how to handle rebates or promotions)
    operation: {
        type: String,
        required: true
    },

    // this is the amount in cents (not dollars!)
    // it can be positive (credit) or negative (charge)
   amount: {
        type: Number,
        required: true
    },

    // The user's balance after the operation has been
    // applied
    balance: {
        type: Number,
        required: true
    },

    // billing date
    date: {
        type: Date,
        required: true
    },

    // extra information (like simulator id)
    note: {
        type: String,
        default: ''
    }
});

// Validations
BillingSchema.path('amount').validate(function(s) {
    return s !== null;
}, 'amount cannot be null');

BillingSchema.path('date').validate(function(s) {
    return s !== null;
}, 'date must be set');

BillingSchema.path('operation').validate(function(s) {
    return s !== null;
}, 'operation must be set');


BillingSchema.path('user').validate(function(s) {
    return s !== null;
}, 'User must be set');

mongoose.model('Billing', BillingSchema);

