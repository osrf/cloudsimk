var db = require('../lib/sim_db');
var db_name = "db_" + process.argv[2];


// internal function that
// returns a database connection
// for the logged on user
function get_db(req)
{
    var user = "test_user";
    console.log("GETDB: " + req);
    var my_db = new db.sim_db(user);
    return my_db;
}

// REST API cRud for history collection
// returns the list of simulations for the current user.
function read(req, res)
{
    var my_db = get_db(req);
    my_db.get_history(function(err, sims){
        console.log("results: " + sims.length);
        res.json(sims);
    });
}

// REST API cruD for history collection
// terminates a simulation by setting its 
// state to terminated
function del(req, res)
{
    var my_db = get_db(req);
    var id = req.params.id;

    console.log("DEL");
    my_db.remove_from_history(id, function(err, dead_sim){
        res.json(dead_sim);
    });
}

  
exports.read = read;
exports.del = del;

