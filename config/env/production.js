'use strict';

module.exports = {
    socket_io_log_level: 3,
    db: 'mongodb://localhost/mean-production',
    app: {
        name: 'CloudSim - Cloud-hosted robot simulation'
    },
    google: {
        returnURL: 'http://cloudsim.io/auth/google/callback',
        realmURL: 'http://cloudsim.io/'
    },
    yahoo: {
        returnURL: 'http://cloudsim.io/auth/yahoo/callback',
        realmURL: 'http://cloudsim.io/'
    },
    openid: {
        returnURL: 'http://cloudsim.io/auth/openid/callback',
        realmURL: 'http://cloudsim.io/'
    },
    aol: {
        returnURL: 'http://cloudsim.io/auth/aol/callback',
        realmURL: 'http://cloudsim.io/'
    }
};
