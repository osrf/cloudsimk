'use strict';
/// @module billing_controller
/// Server side billing controller.

/// Module dependencies.

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
              // Payment has been confirmed as completed
              // req.body.mc_gross: transaction amount
              // req.body.custom: user id.
          }
      }
  });
};
