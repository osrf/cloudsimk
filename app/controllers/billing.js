'use strict';
/// @module billing_controller
/// Server side billing controller.


/// Module dependencies.
var Duration = require('duration');
var mongoose = require('mongoose'),
    Simulation = mongoose.model('Simulation'),
    User = mongoose.model('User'),
    CloudsimUser = mongoose.model('CloudsimUser'),
    Billing = mongoose.model('Billing');
var sockets = require('../lib/sockets');


// var util  = require('util');

/////////////////////////////////////////////////
/// Process a Paypal Instant Payment Notification (IPN) message
/// @param req Nodejs request object.
/// @param res Nodejs response object.
exports.paypal_ipn = function(req, res) {
  // Must respond to PayPal IPN request with an empty 200 first
  res.send(200);

  var ipn = require('paypal-ipn');

  ipn.verify(req.body, function callback(err, msg) {
      if (err) {
          console.error(msg);
      } else {
          console.log('paypal ipn msg ' + msg);
          //Do stuff with original params here
          if (req.body.payment_status === 'Completed') {
              console.log ('completed');
              console.log('user ' + req.body.custom);
              console.log('amount ' + req.body.mc_gross);
              //Payment has been confirmed as completed
          }
      }
  });
};


exports.accountDeposit = function(userId, amountInCents, note, cb) {

    // find cloudsimUser and add the money
     CloudsimUser.findOneAndUpdate({user: userId}, 
                                   {$inc: {account_balance: amountInCents }},
                                    function(err, cloudsimUser) {
        if (err) {
            console.log('account top up error:' + err);
            cb(err);
        }
        else {
            // the balance is updated, let's write a billing document
            var billing = new Billing({ user: userId,
                                        operation: "deposit",
                                        amount: amountInCents,
                                        balance: cloudsimUser.account_balance,
                                        date: new Date(),
                                        note: note
                                      });
            billing.save(function(err) {
                if(err) {
                    console.error('Error saving billing information: ' + err);
                    cb(err);
                } else {
                    cb(null, cloudsimUser.account_balance);
                }
            });
        }
    }); 
} 


////////////////////////////////////////////////////////////

// Helper functiont that adds seconds to a date
function addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds *1000);
}

//////////////////////////////////////////////////////////////////
// Helper function that compares a date d with the current date.
// @param d the Date to compare things with.
// returns a negative number if d is in the future
function secondsSince(d) {
    var now = new Date();
    var duration = new Duration(d, now);
    return duration.seconds;
}

///////////////////////////////////////////////////////////////////////////
// Calculates how much a user should be charged for running a
// simulator, and, if charged, until when. If the dueDate is in the future,
// the charge is 0.
// @param dueDate the moment until the simulator is paid for
// @param the cost per hour for the server in cents
// @return the bill, with the amount to be charged (bill.chargeInCents)
// and the moment until it will remain paid for (bill.validUntil)
exports.charge = function (dueDate, costPerHourInCents) {
    var bill = {chargeInCents: 0, validUntil:dueDate};
    var secondsLate = secondsSince(dueDate);
    if (secondsLate < 0) {
        // not late yet
        return bill;
    }
    // calculate how many hours to bill
    var hoursToBill = 1 + Math.round(secondsLate / 3600);
    bill.chargeInCents = hoursToBill * costPerHourInCents;
    bill.validUntil = addSeconds(dueDate, 3600 * hoursToBill);
    return bill;
}



