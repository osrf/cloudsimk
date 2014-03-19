'use strict';

module.exports = {
    db: 'mongodb://localhost/mean-test',
    port: 3001,
    app: {
        name: 'CloudSim - Cloud-hosted robot simulation - Test'
    },
    google: {
            returnURL: 'http://localhost:3000/auth/google/callback',
            realmURL: 'http://localhost:3000/'
        },
    yahoo: {
            returnURL: 'http://localhost:3000/auth/yahoo/callback',
            realmURL: 'http://localhost:3000/'
        },
    openid: {
            returnURL: 'http://localhost:3000/auth/openid/callback',
            realmURL: 'http://localhost:3000/'
        },
    aol: {
            returnURL: 'http://localhost:3000/auth/aol/callback',
            realmURL: 'http://localhost:3000/'
        }
};
