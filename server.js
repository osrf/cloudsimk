
var simulations = require("./routes/simulations");
var history = require("./routes/history");
var api = require('./routes/api');


// var app = connect();

var express = require("express");


var app = express();

function hello(req, res){
    res.setHeader('Content-Type', 'text/plain');
    res.end("\n\nyou have reached: hello\n\n");
}

app.use(express.favicon());
app.use(express.logger());
app.use(express.bodyParser());

// authentication
app.use('/api', api.auth); 
// api routes
app.get('/api/simulations/:id/keys', simulations.download_keys)
app.get('/api/simulations', simulations.read);
app.post('/api/simulations', simulations.create);
app.put('/api/simulations/:id', simulations.update);
app.del('/api/simulations/:id', simulations.del);

app.get('/api/history', history.read);
app.del('/api/history/:id', history.del);

app.use(express.static(__dirname + '/public'));

// where we get to when we got nothing ;-)
app.use(hello)

var port = process.argv[2];

console.log("listening at port " + port);
console.log("Directory: " + __dirname); 
app.listen(port);

