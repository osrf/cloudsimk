'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Simulation = mongoose.model('Simulation');

//Globals
var user;
var simulation;

//The tests
describe('<Unit Test>', function() {
    describe('Model simulation:', function() {
        beforeEach(function(done) {
            
         //   Simulation.remove({}, function(err) {
         //       should.not.exist(err);
                
                user = new User({
                    name: 'Simulation Tester',
                    email: 'test_sim@test.com',
                    username: 'sim_user',
                    password: 'password'
                });

                user.save(function() {
                    simulation = new Simulation({
                        world: 'brave new world',
                        region: 'region',
                        date_launch: Date.now(),
                        state: 'Running',
                        user: user
                    });

                    done();
                });
          //  });
        });

        describe('Method Save', function() {
            it('', function(done) {
                Simulation.remove({}, function(err) {
                    should.not.exist(err);
                    done();
                });
            });

            it('db should be empty', function(done) {
                Simulation.getRunningSimulations(function(err, sims) {
                    should.not.exist(err);
                    sims.length.should.equal(0);
                    done();
                });
            });


            it('should be able to save without problems', function(done) {
                simulation.save(function(err, sim) {
                    should.not.exist(err);
                    should.exist(sim);
                    // it should now be in the db
                    Simulation.getRunningSimulations(function(err, sims) {
                        should.not.exist(err);
                        should.exist(sims);
                        sims.length.should.equal(1);
                        done();
                    });
                });
            });

            it('should be able to show an error when try to save without world', function(done) {
                simulation.world = '';
                return simulation.save(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save without region', function(done) {
                simulation.region = '';
                return simulation.save(function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        afterEach(function(done) {
            simulation.remove();
            user.remove();
            done();
        });
    });
});
