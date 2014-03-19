'use strict';

module.exports = {
    db: 'mongodb://localhost/mean-test',
    port: 3001,
    app: {
        name: 'CloudSim - Cloud-hosted robot simulation - Test'
    },
    google: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    yahoo: {
        clientID: 'APP_ID',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://localhost:3000/auth/yahoo/callback'
    },
    openid: {
        clientID: 'APP_ID',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://localhost:3000/auth/openid/callback'
    },
    aol: {
        clientID: 'APP_ID',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://localhost:3000/auth/aol/callback'
    }
};
