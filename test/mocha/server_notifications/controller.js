'use strict';

/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Simulation = mongoose.model('Simulation'),
    User = mongoose.model('User'),
    util = require('../util'),
    should = require('should'),
    app = require('../../../server'),
    supertest = require('supertest');


var user;
var token;
var agent;

describe('<Unit Test>', function() {
    describe('Server_notification Controller:', function() {
        before(function(done) {
            User.remove({}, function(err){
                if (err){
                    should.fail(err);
                }
                user = new User({
                    open_id: 'myopenid',
                    name: 'User Tester',
                    email: 'user_test@test.com',
                    username: 'user',
                    password: 'pass',
                    provider: 'local'
                });
                user.save(function() {
                    agent = supertest.agent(app);
                    agent
                    .post('/users/session')
                    .set('Acccept', 'application/json')
                    .send({ email: 'user_test@test.com', password:'pass' })
                    .end(function(err,res){
                        // 302 Moved Temporarily  200 OK
                        res.should.have.status(302);

                        // clear the simulation collection before the tests
                        Simulation.remove({}, function(err){
                            if (err){
                                should.fail(err);
                            }
                            done();
                        });
                    });
                });
            });
        });

        describe('Check Empty Running Simulation', function() {
            it('should be no running simulations at the beginning', function(done) {
                agent
                .get('/simulations?state=Launching')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    JSON.parse(res.text).length.should.be.exactly(0);
                    done();
                });
            });
        });

        describe('Check Create Simulation', function() {
            it('should be possible to create a simulation', function(done) {
                agent
                .post('/simulations')
                .set('Acccept', 'application/json')
                .send({ world: 'empty.world', region:'US East' })
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var sim = JSON.parse(res.text);
                    sim.sim_id.should.be.exactly(0);
                    sim.state.should.equal('Launching');
                    token = sim.secret_token;
                    token.should.be.a.String;
                    done();
                });
            });
        });

        describe('Check bad notification', function() {
            it('Should not work with the wrong token', function(done) {
                agent
                .post('/server_notifications')
                .set('Accept', 'application/json')
                .send({world: "empty.world", token:'8630333c-8093-4c68-8854-05a53a57d8f3' })
                .end(function(err, res){

                    if(err) should.fail(err);

                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    console.log('res:' + res.text);
                    var res = JSON.parse(res.text);
                    res.result.should.equal('Error');

                    done();
                });
            });
        });

        describe('Check notification', function() {
            it('Should work with the right token', function(done) {
                agent
                .post('/server_notifications')
                .set('Accept', 'application/json')
                .send({world: "empty.world", token: token})
                .end(function(err, res){
                     
                    if(err) should.fail(err);

                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    console.log('res:' + res.text);
                    var res = JSON.parse(res.text);
                    res.result.should.equal('OK');
                    
                    done();
                });
            });
        });


        after(function(done) {
            user.remove();
            done();
        });
    });
});
    

