
//var connect = require("connect");
var simulations = require("./lib/simulations");
// var users = require("./lib/users");


// var app = connect();

var express = require("express");


var app = express();

function hello(req, res){
    res.setHeader('Content-Type', 'text/plain');
    res.end("\n\nyou have reached: hello\n\n");
}

app.use(express.logger());
app.use(express.bodyParser());

app.get('/simulations/:id/keys', simulations.download_keys)
app.get('/simulations/:id', simulations.read);
app.get('/simulations', simulations.list);
app.post('/simulations', simulations.create);
app.put('/simulations/:id', simulations.update);
app.del('/simulations/:id', simulations.del);


//app.use('/simulations', simulations.simulations);
//app.use('/users', users.users);
app.use(express.static(__dirname + '/public'));


app.use(hello)

var port = process.argv[2];

console.log("listening at port " + port);
console.log("Directory: " + __dirname); 
app.listen(port);

