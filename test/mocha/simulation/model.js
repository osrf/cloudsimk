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
                    user: user
                });

                done();
            });
     });

        describe('Method Save', function() {
            it('should be able to save without problems', function(done) {
                return simulation.save(function(err) {
                    should.not.exist(err);
                    done();
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


var sim1, sim2;
var user;
describe('<Unit Test> ', function() {
    describe('Create 2 consecutive sim:', function() {
        beforeEach(function(done) {
            user = new User({
                name: 'Sim test1',
                email: 'test@toto.com',
                username: "test2",
                password: "pass"
            });

             user.save(function() {
 
                sim1  = new Simulation({
                    world: 'brave new world',
                    region: 'region',
                    user: user
                });

                sim2  = new Simulation({
                    world: 'Utopia',
                    region: 'region',
                    user: user
                });
                done();
            });
        });    

        it('should increment the sim_id', function(done) {
            
            var id1, id2;
            sim1.save(function (err) {
                id1 = sim1.sim_id;
                console.log("#@$# " + sim1);
                sim2.save(function (err) {
                    id2 = sim2.sim_id;
                    id2.should.be.equal(id1+1);
                    done();
                });
            });
       
        });

        afterEach(function(done) {
            sim1.remove();
            sim2.remove();
            user.remove();
            done();           
        });
    });
});
