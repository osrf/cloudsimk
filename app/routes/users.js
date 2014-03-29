'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(app, passport) {

    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);
    app.get('/users/me', users.me);

    /// POST /users
    /// Create a new user
    app.post('/users', users.create);

    /// DEL /users
    /// Delete a user
    app.del('/users/:userId', users.remove);

    /// Get all the users
    /// This route should only return data if the user is logged in, and 
    /// is and administrator.
    app.get('/users', users.all);

    // Setting up the userId param
    app.param('userId', users.user);

    // Setting the local strategy route
    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: true
    }), users.session);

    /////////////////////////////////////////////
    // GOOGLE OpenID
    // Setting the google openid routes
    // On success, call app/controllers/users.js:signin
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
    }), users.signin);

    // Callback that is received after openid authentication has completed
    // On success, call app/controllers/users.js:authCallback
    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    /////////////////////////////////////////////
    // YAHOO OpenID
    // Setting the yahoo openid routes
    // On success, call app/controllers/users.js:signin
    app.get('/auth/yahoo', passport.authenticate('yahoo', {
        failureRedirect: '/signin',
    }), users.signin);

    // Callback that is received after openid authentication has completed
    // On success, call app/controllers/users.js:authCallback
    app.get('/auth/yahoo/callback', passport.authenticate('yahoo', {
        failureRedirect: '/signin'
    }), users.authCallback);

    /////////////////////////////////////////////
    // AOL OpenID
    // Setting the aol openid routes
    // On success, call app/controllers/users.js:signin
    app.get('/auth/aol', passport.authenticate('aol', {
        failureRedirect: '/signin',
    }), users.signin);

    // Callback that is received after openid authentication has completed
    // On success, call app/controllers/users.js:authCallback
    app.get('/auth/aol/callback', passport.authenticate('aol', {
        failureRedirect: '/signin'
    }), users.authCallback);

    /////////////////////////////////////////////
    // OpenID OpenID
    // Setting the openid openid routes
    // On success, call app/controllers/users.js:signin
    app.get('/auth/openid', passport.authenticate('openid', {
        failureRedirect: '/signin',
    }), users.signin);

    // Callback that is received after openid authentication has completed
    // On success, call app/controllers/users.js:authCallback
    app.get('/auth/openid/callback', passport.authenticate('openid', {
        failureRedirect: '/signin'
    }), users.authCallback);
};
