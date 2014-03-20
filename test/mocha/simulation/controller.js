'use strict';

/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Simulation = mongoose.model('Simulation'),
    app = require('../../../server');

console.log('app type: ' + typeof app);

var should = require('should');
var supertest = require('supertest');
var util = require('util');

var user;
var agent;

function log_res(res, verbose) {
    if (!verbose)
        return;
    var cookie = res.headers['set-cookie'];
    console.log('cookie: ' + cookie);
    console.log('body: %j',  res.body);
    console.log('redirects: ' + res.redirects.length);
    console.log('text: ' + res.text);
//    console.log('everything: ' + util.inspect(res));
}

describe('<Unit Test>', function() {
    describe('Simulation Controller:', function() {
        before(function(done) {
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

        describe('Check Empty Running Simulation', function() {
            it('should be no running simulations at the beginning', function(done) {
                agent
                .get('/simulations/running')
                .end(function(err,res){
                    log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    JSON.parse(res.text).length.should.be.exactly(0);
                    done();
                });
            });
        });

        describe('Check Create Simulation', function() {
            it('should be able to create a simulation', function(done) {
                agent
                .post('/simulations')
                .set('Acccept', 'application/json')
                .send({ world: 'empty.world', region:'africa' })
                .end(function(err,res){
                    log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.sim_id.should.be.exactly(0);
                    text.state.should.equal('Launching');
                    text.region.should.equal('africa');
                    text.world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Check One Simulation Created', function() {
            it('should be one running simulation', function(done) {
                agent
                .get('/simulations/running')
                .end(function(err,res){
                    log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.length.should.be.exactly(1);
                    text[0].user.name.should.equal('User Tester');
                    text[0].user.username.should.equal('user');
                    text[0].sim_id.should.be.exactly(0);
                    text[0].state.should.equal('Launching');
                    text[0].region.should.equal('africa');
                    text[0].world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Check Create Second Simulation', function() {
            it('should be able to create another simulation', function(done) {
                agent
                .post('/simulations')
                .set('Acccept', 'application/json')
                .send({ world: 'blank.world', region:'asia' })
                .end(function(err,res){
                    log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    // the sim_id should increment by 1
                    text.sim_id.should.be.exactly(1);
                    text.state.should.equal('Launching');
                    text.region.should.equal('asia');
                    text.world.should.equal('blank.world');
                    done();
                });
            });
        });

        describe('Check Two Simulations Created', function() {
            it('should be two running simulations', function(done) {
                agent
                .get('/simulations/running')
                .end(function(err,res){
                    log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.length.should.be.exactly(2);
                    text[0].user.name.should.equal('User Tester');
                    text[0].user.username.should.equal('user');
                    text[0].sim_id.should.be.exactly(0);
                    text[0].state.should.equal('Launching');
                    text[0].region.should.equal('africa');
                    text[0].world.should.equal('empty.world');
                    text[1].user.name.should.equal('User Tester');
                    text[1].user.username.should.equal('user');
                    text[1].sim_id.should.be.exactly(1);
                    text[1].state.should.equal('Launching');
                    text[1].region.should.equal('asia');
                    text[1].world.should.equal('blank.world');
                    done();
                });
            });
        });

        describe('Check Delete Simulation', function() {
            it('should be able to delete a simulation', function(done) {
                agent
                .del('/simulations/running/0')
                .set('Acccept', 'application/json')
                .end(function(err,res){
                    if (err)
                      console.log('err' + err );
                    log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    done();
                });
            });
        });

        describe('Check Unauthorized Running Simulation', function() {
            it('should not be able to see running simulations', function(done) {
                var agentUnauthorized = supertest.agent(app);
                agentUnauthorized
                .get('/simulations/running')
                .end(function(err,res){
                    log_res(res);
                    res.should.have.status(401);
                    done();
                });
            });
        });

        describe('Check Unauthorized Simulation History', function() {
            it('should not be able to see simulation history', function(done) {
                var agentUnauthorized = supertest.agent(app);
                agentUnauthorized
                .get('/simulations/history')
                .end(function(err,res){
                    log_res(res);
                    res.should.have.status(401);
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

