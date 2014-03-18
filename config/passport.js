'use strict';

var mongoose = require('mongoose'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    YahooStrategy = require('passport-yahoo-oauth').Strategy,
    BitbucketStrategy = require('passport-bitbucket').Strategy,
    GitHubStrategy = require('passport-github').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    User = mongoose.model('User'),
    config = require('./config');

module.exports = function(passport) {

    // Serialize the user id to push into the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserialize the user object based on a pre-serialized token
    // which is the user id
    passport.deserializeUser(function(id, done) {
        User.findOne({
            _id: id
        }, '-salt -hashed_password', function(err, user) {
            done(err, user);
        });
    });

    // Use yahoo strategy
    passport.use(new YahooStrategy({
            consumerKey: config.yahoo.clientID,
            consumerSecret: config.yahoo.clientSecret,
            callbackURL: config.yahoo.callbackURL
        },
        function(token, tokenSecret, profile, done) {
            User.findOne({
                'yahoo.id': profile.id
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        username: profile.username,
                        provider: 'yahoo',
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

    // Use bitbucket strategy
    passport.use(new TwitterStrategy({
            consumerKey: config.bitbucket.clientID,
            consumerSecret: config.bitbucket.clientSecret,
            callbackURL: config.bitbucket.callbackURL
        },
        function(token, tokenSecret, profile, done) {
            User.findOne({
                'bitbucket.id': profile.id
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        username: profile.username,
                        provider: 'bitbucket',
                        bitbucket: profile._json
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


    // Use twitter strategy
    passport.use(new TwitterStrategy({
            consumerKey: config.twitter.clientID,
            consumerSecret: config.twitter.clientSecret,
            callbackURL: config.twitter.callbackURL
        },
        function(token, tokenSecret, profile, done) {
            User.findOne({
                'twitter.id_str': profile.id
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        username: profile.username,
                        provider: 'twitter',
                        twitter: profile._json
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

    // Use facebook strategy
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({
                'facebook.id': profile.id
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.username,
                        provider: 'facebook',
                        facebook: profile._json
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


    // Use github strategy
    passport.use(new GitHubStrategy({
            clientID: config.github.clientID,
            clientSecret: config.github.clientSecret,
            callbackURL: config.github.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({
                'github.id': profile.id
            }, function(err, user) {
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.username,
                        provider: 'github',
                        github: profile._json
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

    // Use google strategy
    passport.use(new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({
                'google.id': profile.id
            }, function(err, user) {
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.emails[0].value,
                        provider: 'google',
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
};
