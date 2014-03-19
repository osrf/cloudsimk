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
            User.findOne({open_id: identifier}, function(err, user) {
                if (!user) {
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
    ));

    // Use yahoo strategy
    passport.use(new YahooStrategy({
        returnURL: config.google.returnURL,
        realm: config.google.realmURL
        },
        function(identifier, profile, done) {
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
        returnURL: config.google.returnURL,
        realm: config.google.realmURL
        },
        function(identifier, profile, done) {
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
        returnURL: config.google.returnURL,
        realm: config.google.realmURL
        },
        function(identifier, profile, done) {
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
