'use strict';
/// @module users_controller
/// Server side users controller


/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User');

/////////////////////////////////////////////////
/// Authentication callback
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Authentication callback.
exports.authCallback = function(req, res) {
    res.redirect('/#!/');
};

/////////////////////////////////////////////////
/// Show login form
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

/////////////////////////////////////////////////
/// Show sign up form
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/////////////////////////////////////////////////
/// Logout
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/////////////////////////////////////////////////
/// Session
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.session = function(req, res) {
    res.redirect('/');
};

/////////////////////////////////////////////////
/// Create user
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @param[in] next The next Nodejs function to be executed.
/// @return Function to create a user.
exports.create = function(req, res, next) {
    // Create a new user based on the value in the request object
    var user = new User(req.body);
    var message = null;

    user.provider = 'local';

    // Save the user to the database
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Username already exists';
                    break;
                default:
                    message = 'Please fill all the required fields';
            }

            return res.render('users/signup', {
                message: message,
                user: user
            });
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
};

/////////////////////////////////////////////////
/// Send User
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/////////////////////////////////////////////////
/// Find user by openid
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @param[in] next The next Nodejs function to be executed.
/// @param[in] id The openid of the user to retrieve.
exports.user = function(req, res, next, id) {
    // Use mongo's findOne function to get a user based on the openid value
    User.findOne({
        open_id: id
    })
    // The function to execute when the user is found.
    .exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));

        // Store the user information in the request's profile
        req.profile = user;

        // Pass control to the next middleware
        next();
    });
};
