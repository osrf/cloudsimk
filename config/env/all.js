'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {

    // Consttants that affect the billing. 
    // billingCycleFrequencyInSecs controls the Frequency at which
    // the billing is done (20 sec default). billingCycleFrequencyInSecs
    // is actually the period in sec (as opposed to the rate, in sec -1)
    // The billing period, billingPeriodInSecs, is the duration for which 
    // simulation servers are charged (default 1 hr). 
    // Changing these values is useful during testing, and allows to 
    // observe payments faster.
    billingCycleFrequencyInSecs: 20,
    billingPeriodInSecs: 3600,

    
    // the temporary directory where the zip files are made
    // for the zip download
    downloadsDir: '/tmp/cloudsimk',
	root: rootPath,
	port: process.env.PORT || 3000,
	db: process.env.MONGOHQ_URL,
	templateEngine: 'swig',

	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'MEAN',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',
	paypalSandbox: true
};
