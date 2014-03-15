'use strict';
var express = require('express');

exports.auth = express.basicAuth(function (user, pass, callback) {
    var result = (user === 'testUser' && pass === 'testPass');
    if (!result) {
        console.log("user: " + user + ", pass: " + pass + " not found");
    }
    callback(null, result);
});
