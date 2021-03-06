'use strict';
/// @module billing_controller
/// Server side billing controller.

/// Module dependencies.
var Duration = require('duration');
var mongoose = require('mongoose'),
    CloudsimUser = mongoose.model('CloudsimUser'),
    Billing = mongoose.model('Billing');


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
          // Payment has been confirmed as completed
          // req.body.mc_gross: transaction amount
          // req.body.custom: user id.
          console.log('paypal ipn msg ' + msg);
          //Do stuff with original params here
          if (req.body.payment_status === 'Completed') {
                // fetch the user id hidden in the custom field
                var userId = req.body.custom;
                var amountInCents = req.body.mc_gross * 100;
                var note = 'Paypal payment';
                exports.accountDeposit(userId, amountInCents, note, function(err) {
                    if (err) {
                        var msg = 'The Paypal payment of ' + amountInCents + ' cents ';
                        msg += 'for user ' + userId + ' was not deposited. ';
                        msg += 'Error: ' + err ;
                        console.error(msg);
                    }
                    else {
                        console.log('Paypal payement received from user ' + userId);
                    }
                });
          }
      }
  });
};


/////////////////////////////////////////////////
// Remove $ from account. Updates the balance, writes a billing doc in db
// @param userId the __id of the user in the 
exports.accountWithdrawal = function(userId, amountInCents, note, cb) {

     // find cloudsimUser and add the money
     var amount = -1.0 * amountInCents;
     CloudsimUser.findOneAndUpdate({user: userId},
                                   {$inc: {account_balance: amount }},
                                    function(err, cloudsimUser) {
        if (err) {
            console.log('account withdrawal error:' + err);
            cb(err);
        }
        else {
            // the balance is updated, let's write a billing document
            var billing = new Billing({ user: userId,
                                        operation: 'withdrawal',
                                        amount: amountInCents,
                                        balance: cloudsimUser.account_balance,
                                        date: new Date(),
                                        note: note
                                      });
            billing.save(function(err) {
                if(err) {
                    console.error('Error saving billing information after withdrawal: ' + err);
                    cb(err);
                } else {
                    cb(null, cloudsimUser.account_balance);
                }
            });
        }
    });
};

/////////////////////////////////////////////////
// Add $ to account. Updates the user balance in the CloudsimUsers collection
// and adds a document to the Billings collection. This opertation is 
// performed as when a Paypal confirmation is received.
// @param userId the __id in the Users collection
// @param amountInCents the deposit amount
// @param note the deposit reason (i.e Paypal, refund, bonus credit)
// @param cb callback function with signature: (err, newAccountBalance)
exports.accountDeposit = function(userId, amountInCents, note, cb) {

    // find cloudsimUser and add the money
     CloudsimUser.findOneAndUpdate({user: userId}, 
                                   {$inc: {account_balance: amountInCents }},
                                    function(err, cloudsimUser) {
        if (err) {
            console.log('account deposit error:' + err);
            cb(err);
        }
        else {
            // the balance is updated, let's write a billing document
            var billing = new Billing({ user: userId,
                                        operation: 'deposit',
                                        amount: amountInCents,
                                        balance: cloudsimUser.account_balance,
                                        date: new Date(),
                                        note: note
                                      });
            billing.save(function(err) {
                if(err) {
                    console.error('Error saving billing information after deposit: ' + err);
                    cb(err);
                } else {
                    cb(null, cloudsimUser.account_balance);
                }
            });
        }
    }); 
};



/////////////////////////////////////////////////
// Helper functiont that adds seconds to a date
function addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds *1000);
}

/////////////////////////////////////////////////
// Helper function that compares a date d with the current date.
// @param d the Date to compare things with.
// @param dateNow the reference date (or now if undefined)
// returns a negative number if d is in the future (from now)
function secondsSince(d, dateNow) {
    var now = dateNow;
    if(!now) now = new Date();
    var duration = new Duration(d, now);
    return duration.seconds;
}

/////////////////////////////////////////////////
// Calculates how much a user should be charged for running a
// simulator, and, if charged, until when. If the dueDate is in the future,
// the charge is 0.
// @param dueDate the moment until the simulator is paid for
// @param the cost per hour for the server in cents
// @param dateNow the current time, or undefined (will use new Date())
// @return the bill, with the amount to be charged (bill.chargeInCents)
// and the moment until it will remain paid for (bill.validUntil)
exports.charge = function (dueDate, costPerPeriodInCents, dateNow, billPeriodInSecs) {

    var now = dateNow;    
    if(!now) now = new Date();

    var period = billPeriodInSecs;
    if(!period) period = 3600; // 1 hour

    var bill = {chargeInCents: 0, validUntil:dueDate};
    var secondsLate = secondsSince(dueDate, now);
    if (secondsLate < 0) {
        // not late yet
        return bill;
    }
    // calculate how many hours to bill
    var periodsToBill = 1 + Math.round(secondsLate / period);
    bill.chargeInCents = periodsToBill * costPerPeriodInCents;
    bill.validUntil = addSeconds(dueDate, period * periodsToBill);
    return bill;
};




