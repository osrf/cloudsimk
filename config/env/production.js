'use strict';

module.exports = {
    db: 'mongodb://localhost/mean',
    app: {
        name: 'CloudSim - Cloud-hosted robot simulation'
    },
    google: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    yahoo: {
        clientID: 'API_KEY',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://localhost:3000/auth/yahoo/callback'
    },
    bitbucket: {
        clientID: 'API_KEY',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://localhost:3000/auth/bitbucket/callback'
    },
    github: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/github/callback'
    },
    facebook: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    },
    twitter: {
        clientID: 'CONSUMER_KEY',
        clientSecret: 'CONSUMER_SECRET',
        callbackURL: 'http://localhost:3000/auth/twitter/callback'
    }
};
