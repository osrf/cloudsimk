'use strict';

var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    GoogleStrategy = require('passport-google').Strategy,
    YahooStrategy = require('passport-yahoo').Strategy,
    OpenIDStrategy = require('passport-openid').Strategy,
    AOLStrategy = require('passport-aol').Strategy,
    User = mongoose.model('User'),
    config = require('./config');

module.exports = function(passport) {

    // Serialize the user id to push into the session
    passport.serializeUser(function(user, done) {
        done(null, user.open_id);
    });

    // Deserialize the user object based on a pre-serialized token
    // which is the user id
    passport.deserializeUser(function(id, done) {
        User.findOne({
            open_id: id
        }, '-salt -hashed_password', function(err, user) {
            done(err, user);
        });
    });

    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            User.findOne({
                email: email
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
                return done(null, user);
            });
        }
    ));

    // Use google strategy
    passport.use(new GoogleStrategy({
        returnURL: config.google.returnURL,
        realm: config.google.realmURL
        },
        function(identifier, profile, done) {
            // Check to see if the user's email exists in the
            // database. If it does, that mean's they were added
            // by an admin or they are already registered.
            User.findOne({email: profile.emails[0].value},
                function(err, addedUser) {
                    // If the user's provider is 'local', then they were
                    // added by an admin, and their information should be
                    // updated.
                    if (addedUser && addedUser.provider === 'local') {
                        addedUser.name = profile.displayName;
                        addedUser.email = profile.emails[0].value;
                        addedUser.username = profile.emails[0].value;
                        addedUser.provider = 'google';
                        addedUser.open_id = identifier;
                        addedUser.google = profile._json;

                        // Save the added user's infor and return.
                        addedUser.save(function(err) {
                            if (err) console.log(err);
                            return done(err, addedUser);
                        });
                    }
                    // Otherwise, the user should already exist in the
                    // system with a valid open_id.
                    else {
                        User.findOne({open_id: identifier},
                            function(err, user) {
                            if (!user) {
                                // We are restricting users to only OSRF
                                // people using their google accounts
                                return done({
                                    message:
                                    "CloudSim is closed to external users.",
                                    stack:
                                    "CloudSim is closed to external users."
                                });

                                // This is the default code to add a new
                                // user with openid credentials
                                user = new User({
                                    name: profile.displayName,
                                    email: profile.emails[0].value,
                                    username: profile.emails[0].value,
                                    provider: 'google',
                                    open_id: identifier,
                                    google: profile._json
                                });
                                user.save(function(err) {
                                    if (err) console.log(err);
                                    return done(err, user);
                                });
                            } else {
                                return done(err, user);
                            }
                        });
                    }
            });
        }
    ));

    // Use yahoo strategy
    passport.use(new YahooStrategy({
        returnURL: config.yahoo.returnURL,
        realm: config.yahoo.realmURL
        },
        function(identifier, profile, done) {
            // We are restricting users to only OSRF people using
            // their google accounts
            return done({
                message: "CloudSim is closed to external users.",
                stack: "CloudSim is closed to external users."
            });

            User.findOne({open_id: identifier}, function(err, user) {
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.emails[0].value,
                        provider: 'yahoo',
                        open_id: identifier,
                        yahoo: profile._json
                    });
                    user.save(function(err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                } else {
                    return done(err, user);
                }
            });
        }
    ));

    // Use openid strategy
    passport.use(new OpenIDStrategy({
        returnURL: config.openid.returnURL,
        realm: config.openid.realmURL
        },
        function(identifier, profile, done) {
            // We are restricting users to only OSRF people using
            // their google accounts
            return done(null, false, {
                message: "CloudSim is closed to external users.",
            });

            User.findOne({open_id: identifier}, function(err, user) {
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.emails[0].value,
                        provider: 'openid',
                        open_id: identifier,
                        openid: profile._json
                    });
                    user.save(function(err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                } else {
                    return done(err, user);
                }
            });
        }
    ));

    // Use aol strategy
    passport.use(new AOLStrategy({
        returnURL: config.aol.returnURL,
        realm: config.aol.realmURL
        },
        function(identifier, profile, done) {
            // We are restricting users to only OSRF people using
            // their google accounts
            return done(null, false, {
                message: "CloudSim is closed to external users.",
            });

            User.findOne({open_id: identifier}, function(err, user) {
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.emails[0].value,
                        provider: 'aol',
                        open_id: identifier,
                        aol: profile._json
                    });
                    user.save(function(err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                } else {
                    return done(err, user);
                }
            });
        }
    ));
};
