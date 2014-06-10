'use strict';

// this route is for simulator servers that callback into cloudsim

module.exports = function(app) {
    // Simulation server 
    var notifications = require('../controllers/server_notifications');
    app.post('/server_notifications', notifications.simulatorCallback);
};
