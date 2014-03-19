'use strict';

module.exports = {
    db: 'mongodb://localhost/mean',
    app: {
        name: 'CloudSim - Cloud-hosted robot simulation'
    },
    google: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://cloudsim.io/auth/google/callback'
    },
    yahoo: {
        clientID: 'APP_ID',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://cloudsim.io/auth/yahoo/callback'
    },
    openid: {
        clientID: 'APP_ID',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://cloudsim.io/auth/openid/callback'
    },
    aol: {
        clientID: 'APP_ID',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://cloudsim.io/auth/aol/callback'
    }
};
