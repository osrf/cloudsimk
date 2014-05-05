'use strict';

module.exports = {
    socket_io_log_level: 3,
    db: 'mongodb://localhost/mean-dev',
    app: {
        name: 'CloudSim - Cloud-hosted robot simulation - Development'
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
