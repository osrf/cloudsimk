'use strict';

var config = require('../../config/config');

exports.render = function(req, res) {
    // The following set the global user variable.
    // See also app/views/index.html
    if (req.user) {
        res.render('index', {
            user: req.user ? JSON.stringify(req.user) : 'null',
            paypalSandbox : config.paypalSandbox
        });
    }
    else {
        res.render('index_landing', {
            user: req.user ? JSON.stringify(req.user) : 'null'
        });
    }
};
