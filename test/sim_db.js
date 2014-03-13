
console.log(__dirname);

var db = require('../lib/sim_db')
var assert = require('assert');


var db_name = "sim_test";
var db_user = "test_user";

// connect to the database once
db.connect(db_name);

// erase the database before each test
describe('sim_db', function(){
    beforeEach(function(done){
        console.log("\n\nclearing database before");
        db.clear_db(function(err){
	    console.log("db cleared");
	    done();
	});
	
    });

    // assert that the database is empty of running sims
    // and history

    describe('Empty db', function(){
	console.log('empty db');
        it('should have 0 running simulations', function(done){
            var count = 0;
            var my_db = new db.sim_db(db_user);
            
            my_db.get_running_simulations(function(err, results){
                if(err){
                    assert(0 == 1);    
                }
                console.log("got results: " + results)
                count += results.length;
		assert(count == 0);
		done();
            });
        });
        
        it('should have 0 history', function(done){
            var count = 0;
            var my_db = new db.sim_db(db_user);

            my_db.get_history(function(err, results){
                if(err){
                    assert(0 == 1);   
                }
                console.log("got history results: " + results)
                count += results.length;
		assert(count == 0);
		done();
            });
        });
      });

      // test that inserts one simulation, terminates it 
      // and verify that running sims went to 1 and then 0
      // while history went from 0 to 1
      describe('one sim', function(){
	 
        it('should have a single sim', function(done) {
            console.log('one sim');
            var my_db = new db.sim_db(db_user);
            var sim_id;

            // create a sim
            my_db.create_sim("brave new world", "region", function(err, sim){
                if(err){
		            console.log("error: " + err);
                    assert(0==1);
                }
                sim_id = sim.sim_id;
                console.log("new sim id: " + sim_id);  
                my_db.get_running_simulations(function(err, results){
                    var count = results.length;
		            console.log("Found " + count + " results");
		            assert.equal(count, 1);
                    
                    // terminate the sim
	                my_db.change_state(sim_id, "terminated", function(err, changed_sim){
                    console.log("terminated sim: " + changed_sim);
                    // no more running sims
                    my_db.get_running_simulations(function(err, results){
                        console.log("remaining sims: " + results)
                        assert.equal(results.length, 0);
                        // history has 1 sim
                        my_db.get_history(function(err, results){
                            console.log("err: " + err);
                            //console.log(type(results));
                            console.log("history count: " + results.length);
                            console.log("HISTORY: " + results);
                            assert.equal(results.length, 1);
                            done();
                        });     
                    });
                });
             });
           });
        });

        // create a sim, change the simulation world        
        describe('change the word', function(){
            it('should be possible to change the world', function(done) {
                var my_db = new db.sim_db(db_user);
                
                my_db.create_sim("initial_world", "region", function(err, sim){
                    if(err){
                        console.log("error: " + err);
                        assert(0==1);
                    }
                    
                    my_db.change_world(sim.sim_id, "new_world", function(err, sim){
                        assert.equal(sim.world, "new_world");
                        done();
                    });
                });
            });
        });

        // add a sim, terminate and remove the evidence...
        // and then check for an empty history 
        describe('delete history', function(){
            it('history can be deleted', function(done){
                var my_db = new db.sim_db(db_user);
                my_db.create_sim("will not exist", "past", function(err, sim){
                         console.log("soon rip :" + sim.sim_id); 
                         my_db.change_state(sim.sim_id, "terminated", function(err, old_sim){
                         my_db.remove_from_history(sim.sim_id, function(err, dead_sim) {
                             my_db.get_history(function(err, results){
                                 console.log("history: " + results);
                                 console.log("count: " + results.length);
                                 assert.equal(results.length, 0);
                                 done();
                             });
                         });
                    });
                });
            });
	});
    
});    


});

