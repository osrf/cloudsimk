'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User');

var config = require('../../config/config');
var cookie = require('express/node_modules/cookie');
var connectUtils = require('express/node_modules/connect/lib/utils');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Create a schema to access the session documents created by passport / connect
var sessionSchema = new Schema({ _id: String,  session: String, expires: String });
var Session = mongoose.model('Session', sessionSchema);

/////////////////////////////////////////////////////////////////////////////
// Starting with the cookie data obtained  during the websocket authorization
// this function performs a lookup in the session store to find the identity
// of the logged in user. Then, the user is retrieved from the user
// collection, and his id is returned. 
function findUserId(cookieData, cb) {
    var secret = config.sessionSecret;
    var p = cookie.parse(cookieData);
    var sessionIdEncrypted = p['connect.sid'];
    var sessionId  = connectUtils.parseSignedCookie(sessionIdEncrypted, secret);

    Session.find({_id: sessionId}).exec(function (err, sessions) {
        if(err) {
            console.log('Session error:' + err);
            cb(err);
        } else {
            var s = JSON.parse(sessions[0].session);
            var passportUser = s.passport.user;
            User.find({open_id: passportUser}).exec(function (err, users) {
                if(err) {
                    console.log('Cannot find user for this session:' + err);
                    cb(err);
                } else {
                    if(users.length === 1 ) {
                        var userId = users[0]._id;                    
                        cb(null, userId);
                    }
                    else {
                        cb('can\'t find user for this session');
                    }
                }
            });
        }        
    });
}

///////////////////////////////////////////////
// A type that maintains an association between
// sockets and users. Fast lookup of socket 
// list per user.  
function SocketDict() {

    this.sockets = {};
    // a reference to the socket.io library
    this.io = null;

    this.addSocket = function (user, socket) {
        if (!this.sockets[user]) {
            this.sockets[user] = [];
        }
        this.sockets[user].push(socket);
    };

    this.removeSocket = function (socket) {
        for (var user in this.sockets) {
            var array = this.sockets[user];
            var index = array.indexOf(socket);
            if(index > -1) {
                array.splice(index,1);
                return;
            }
        }
    };

    this.getSockets = function (user) {
        return user in this.sockets ? this.sockets[user] : [];
    };
    
    this.notifyUser = function (user, channel, data) {
        var sockets = this.getSockets(user);

        for(var i=0; i<sockets.length; i++) {
            var s = sockets[i];
            s.emit(channel, data);
        }
    };

    this.notifyAll = function (channel, msg) {
        this.io.sockets.emit(channel, msg);    
    };
}

var userSockets = new SocketDict();

exports.getUserSockets = function () {
    return userSockets;
};


/////////////////////////////////////////////////////////////////////////////
// broadcasts the server time periodically
function tick() {
    var now = new Date().toISOString();
    userSockets.notifyAll('time', {data:now});
}

////////////////////////////////////////////////////////////////////////////
// Initialises the socket.io library, and sets up functions called each time 
// a new connection is established or destroyed
//
exports.init = function(io) {
    userSockets.io = io;
    // reduce log verbosity
    io.set('log level', config.socket_io_log_level);
    console.log('Socket.io log level ' +  config.socket_io_log_level + ' [0 (error) to 3 (debug)]');
    // call tick periodically (30 sec)
    setInterval(tick, 30000);

    console.log('Init websockets');
    io.set('authorization', function (data, accept) {
        var cookie = data.headers.cookie;
        findUserId(cookie, function(err, userId) {
            if(err) {
                accept(null, false);
            } else {
                data.userId = userId;
                accept(null, true);
            }
        });
    });

    io.sockets.on('connection', function (socket) {
        var user = socket.handshake.userId;
        userSockets.addSocket(user, socket);
        socket.on('disconnect', function() {
            userSockets.removeSocket(user, socket);
        });
    });
};



