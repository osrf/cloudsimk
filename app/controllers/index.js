'use strict';

var config = require('../../config/config');
var mongoose = require('mongoose'),
    CloudsimUser = mongoose.model('CloudsimUser');

exports.render = function(req, res) {
    // The following set the global user variable.
    // See also app/views/index.html
    if (req.user) {
        CloudsimUser.findFromUserId(req.user._id, function(err, cloudsimUser) {
            if(err) {
                console.error('Can\'t find cloudsimUser data for user ' + req.user.email);
                res.jsonp(500, { error: err });
            }
            else {
                res.render('index', {
                    user: JSON.stringify(req.user),
                    paypalSandbox : config.paypalSandbox,
                    cloudsimUser: JSON.stringify(cloudsimUser) // JSON.stringify(cloudsimUser)
                });
            }
        });
    }
    else {
        res.render('index_landing', {});
    }
};
