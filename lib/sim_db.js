var mongoose = require('mongoose');


// The schema for the simulation
var Sims = new mongoose.Schema({
  sim_id: String,
  user: String,
  world: String,
  region: String,
  date_launch: String,
  date_term: String,
  state: String,
});

mongoose.model('Sim', Sims);
var Sim = mongoose.model('Sim');

// The simulation database interface. This is used by the REST API to
// store data in Mongodb. Each instance is initialized with a user.
function sim_db (user) {
    this.user = user;   // the user that can start/stop the simulation
  
    // returns the list of running simulations for the current user
    this.get_running_simulations = function( cb ){
        
	    Sim.find({'group': this.group, state: {$ne: "terminated" } }, function(err, sims){
		    cb(err, sims);
	    });
    }

    // returns the list of terminated simulations for the current user
    this.get_history = function(cb){
  	Sim.find({'group': this.group, state: "terminated" }, function(err, sims){
		cb(err, sims);
	});  

    }

    // creates a new simulation entry in the database, and sets the state to
    // launching
    this.create_sim = function(world, region,  cb){
        var now = "now";
        var sim = new Sim();
        sim.world = world;
	sim.region = region;
	sim.group = this.group;
	sim.date_launch = "";
	sim.date_term = "";
	sim.state = "launch";	
        sim.sim_id = "sim_" + next_id++;
	console.log("create sim: " + sim);
	debugger;
        sim.save(function(err) {
            console.log('sim saved.');
            cb(err,sim);
        });
        
    }   

    // updates the state of the simulation with a new value
    // values are: launching, running and terminated
    this.change_state = function(sim_id, new_state, cb){
        console.log("update sim");
        var query = {group: this.group, sim_id: sim_id};
        var model = new Sim();
        Sim.findOne(query,  function(err, doc){
            doc.state = new_state;
            console.log("updating " + doc.sim_id); 
            doc.save(function(err){
                console.log("saving");
                cb(err, doc);
            });
        });
     }
       
}


var db; // the connection to the database
var next_id = 1; 

// connects to a database. A database name must
// be provided (i,i  server port number, or "test"). 
// this should be called once when the application starts
function connect(db_name)
{
    var uri = 'mongodb://localhost/' + db_name;
    console.log("connecting to database: " + uri);
    db = mongoose.connect(uri);
}

// mongoose error handler. 
// Because of a bug in Mongoose, this handler must be present
// even if its empty.
mongoose.connection.on('error', function() {});

// erases all data in the current database. This function
// is only used for testing purposes.
function clear_db(cb)
{
    console.log("clear_db: ");
    Sim.remove({}, function(err) {
	console.log("sims removed from db");
	cb(err);
    });
}

// the following structures are available for
// consumers of this module (via require)
exports.sim_db = sim_db;
exports.clear_db = clear_db;
exports.connect = connect;

