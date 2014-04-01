'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    logger = require('mean-logger');


var app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

// Main application entry file.
// Please note that the order of loading is important.


// Load configurations
// Set the node environment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Initializing system variables 
var config = require('./config/config'),
    mongoose = require('mongoose');

// Bootstrap db connection
var db = mongoose.connect(config.db);

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


// Start the app by listening on <port>
//var port = process.env.PORT || config.port;
//app.listen(port);
//console.log('Express app started on port ' + port);

// Initializing logger
logger.init(app, passport, mongoose);

// Sockets setup
var sockets =[];

io.sockets.on('connection', function(socket) {
    console.log('HOUSTON, we have a Connection!');
    sockets.push(socket);
});

/*
function tick () {
    var now = new Date().toUTCString();
    var msg = {data: now};
    io.sockets.emit('message', msg);
}
 setInterval(tick, 500);
*/


// Expose app
exports = module.exports = app;
