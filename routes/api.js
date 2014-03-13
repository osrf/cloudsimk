var express = require('express');


exports.auth = express.basicAuth(function(user, pass, callback) {
    var result = (user === 'testUser' && pass === 'testPass');
    if (!result)
    {
        console.log("user: " + user + ", pass: " + pass + " not found");
    }
    callback(null, result);
});


/*
exports.auth = express.basicAuth(function(name, password, fn){
   
    var user = {name: name, pass: password};
    if (name == "test" && password== "test")
        fn(null, user);
    if (name == "admin" && password== "admin")
        fn(null, user);
    fn();
});
*/

