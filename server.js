'use strict';

// Main application entry file.
// Please note that the order of loading is important.

// Module dependencies.
//
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    logger = require('mean-logger');


var app = express(),
    http = require('http'),
    server = http.Server(app),
    io = require('socket.io')(server);


// Load configurations
// Set the node environment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Initializing system variables 
var config = require('./config/config'),
    mongoose = require('mongoose');

// Bootstrap db connection
console.log('Using database: ' + config.db);
var db = mongoose.connect(config.db);

// make sure the download directory exists
try {
    fs.statSync(config.downloadsDir);
}
catch(err) {
    fs.mkdirSync(config.downloadsDir);
}

// Start the app by listening on <port>
var port = process.env.PORT || config.port;
server.listen(port);
console.log('Express app started on port ' + port);


// Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

// Bootstrap passport config
require('./config/passport')(passport);


// Express settings
require('./config/express')(app, passport, db);

// Bootstrap routes
var routes_path = __dirname + '/app/routes';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            console.log('## loading: ' + newPath);
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath)(app, passport);
            }
        // We skip the app/routes/middlewares directory as it is meant to be
        // used and shared by routes as further middlewares and is not a 
        // route by itself
        } else if (stat.isDirectory() && file !== 'middlewares') {
            walk(newPath);
        }
    });
};
walk(routes_path);


// Initializing logger
logger.init(app, passport, mongoose);

// Sockets setup
var sockets = require('./app/lib/sockets');
sockets.init(io);

// Expose app
exports = module.exports = app;

process.on('uncaughtException', function (error) {
   console.log('uncaughtException!!!\n'+  error.stack);
});

