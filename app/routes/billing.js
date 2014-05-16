'use strict';

// Simulations routes use Simulations controller
var Billing = require('../controllers/billing');

module.exports = function(app) {
    /// POST /paypal_ipn
    /// Post to paypal_ipn
    app.post('/paypal_ipn', Billing.paypal_ipn);
};
