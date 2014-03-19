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



