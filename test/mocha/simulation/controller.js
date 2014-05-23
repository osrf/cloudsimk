'use strict';

console.log('test/mocha/simulation/controller.js');


/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Simulation = mongoose.model('Simulation'),
    User = mongoose.model('User'),
    CloudSimUser = mongoose.model('CloudsimUser'),
    app = require('../../../server'),
    util = require('../util');

console.log('app type: ' + typeof app);

var should = require('should');
var supertest = require('supertest');

var user;
var user2;
var agent;
var user2Cookie;
var csUser;  // cloudsimUser document for user 
var csUser2; // cloudsimUser document for user2

describe('<Unit Test>', function() {
    describe('Simulation Controller:', function() {
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
                user2 = new User({
                    open_id: 'myopenid2',
                    name: 'User Tester2',
                    email: 'user_test2@test.com',
                    username: 'user2',
                    password: 'pass2',
                    provider: 'local'
                });
                user2.save(function () {
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
        });

        describe('Users should have CloudsimUser documents', function() {
            it('should exist for user', function(done) {
              csUser = new CloudSimUser({user: user._id});
              csUser.save(done);
            });
            it('should exist for user2', function(done) {
                csUser2 = new CloudSimUser({user: user2._id});
                csUser2.save(done);
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

        describe('Next sim id', function() {
            it('should exist', function(done) {
                User.find({username: user.username}, function(err, users) {
                    users.should.have.length(1);
                    var theUser = users[0];
                    CloudSimUser.findFromUserId(theUser._id, function(err, cloudsimUser) { 
                        should.not.exist(err);
                        cloudsimUser.next_sim_id.should.be.exactly(-1);
                        done();
                    });
                });
            });
        });

        describe('Check Create Simulation', function() {
            it('should be possible to create a first simulation', function(done) {
                agent
                .post('/simulations')
                .set('Acccept', 'application/json')
                .send({ world: 'empty.world', region:'US East' })
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.sim_id.should.be.exactly(0);
                    text.state.should.equal('Launching');
                    text.region.should.equal('US East');
                    text.world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Next sim id', function() {
            it('should have increased by one', function(done) {
                User.find({username: user.username}, function(err, users) {
                    users.should.have.length(1);
                    var theUser = users[0];
                    //  theUser.next_sim_id.should.be.exactly(1);
                    CloudSimUser.findFromUserId(theUser._id, function(err, cloudsimUser) {
                        cloudsimUser.next_sim_id.should.be.exactly(0);
                        done();
                    });
                });
            });
        });

        describe('Check One Simulation Created', function() {
            it('should be one running simulation', function(done) {
                agent
                .get('/simulations?state=Launching')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.length.should.be.exactly(1);
                    text[0].user.name.should.equal('User Tester');
                    text[0].user.username.should.equal('user');
                    text[0].sim_id.should.be.exactly(0);
                    text[0].state.should.equal('Launching');
                    text[0].region.should.equal('US East');
                    text[0].world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Check Get Simulation by ID', function() {
            it('should be possible to get the first running simulation', function(done) {
                agent
                .get('/simulations/0')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.user.name.should.equal('User Tester');
                    text.user.username.should.equal('user');
                    text.sim_id.should.be.exactly(0);
                    text.state.should.equal('Launching');
                    text.region.should.equal('US East');
                    text.world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Check Create Second Simulation', function() {
            it('should be possible to create another simulation', function(done) {
                agent
                .post('/simulations')
                .set('Acccept', 'application/json')
                .send({ world: 'blank.world', region:'Ireland' })
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    // the sim_id should increment by 1
                    text.sim_id.should.be.exactly(1);
                    text.state.should.equal('Launching');
                    text.region.should.equal('Ireland');
                    text.world.should.equal('blank.world');
                    done();
                });
            });
        });

        describe('Check Two Simulations Created', function() {
            it('should be two running simulations', function(done) {
                agent
                .get('/simulations?state=Launching')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    console.log (text);
                    text.length.should.be.exactly(2);
                    text[0].user.name.should.equal('User Tester');
                    text[0].user.username.should.equal('user');
                    text[0].sim_id.should.be.exactly(0);
                    text[0].state.should.equal('Launching');
                    text[0].region.should.equal('US East');
                    text[0].world.should.equal('empty.world');
                    text[1].user.name.should.equal('User Tester');
                    text[1].user.username.should.equal('user');
                    text[1].sim_id.should.be.exactly(1);
                    text[1].state.should.equal('Launching');
                    text[1].region.should.equal('Ireland');
                    text[1].world.should.equal('blank.world');
                    done();
                });
            });
        });

        describe('Check Get Second Simulation by ID', function() {
            it('should be possible to get the second running simulation', function(done) {
                agent
                .get('/simulations/1')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.user.name.should.equal('User Tester');
                    text.user.username.should.equal('user');
                    text.sim_id.should.be.exactly(1);
                    text.state.should.equal('Launching');
                    text.region.should.equal('Ireland');
                    text.world.should.equal('blank.world');
                    done();
                });
            });
        });

        describe('Check Update Running Simulation by ID', function() {
            it('should not be possible to change the region of a running simulation', function(done) {
                agent
                .put('/simulations/1')
                .send({ world: 'blank_update.world', region:'europe' })
                .end(function(err, res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    console.log(text);
                    text.error.msg.should.equal(
                        'Cannot change the region of a running simulation');
                    done();
                });
            });
        });

        describe('Check Update Running Simulation by ID without region', function() {
            it('should be possible to update a running simulation with no region specified', function(done) {
                agent
                .put('/simulations/1')
                .send({ world: 'blank_update.world'})
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.user.name.should.equal('User Tester');
                    text.user.username.should.equal('user');
                    text.sim_id.should.be.exactly(1);
                    text.state.should.equal('Launching');
                    text.region.should.equal('Ireland');
                    text.world.should.equal('blank_update.world');
                    done();
                });
            });
        });

        describe('Check Get Updated Running Simulation by ID', function() {
            it('should be possible to see the updated simulation', function(done) {
                agent
                .get('/simulations/1')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.user.name.should.equal('User Tester');
                    text.user.username.should.equal('user');
                    text.sim_id.should.be.exactly(1);
                    text.state.should.equal('Launching');
                    text.region.should.equal('Ireland');
                    text.world.should.equal('blank_update.world');
                    done();
                });
            });
        });


        describe('Check Terminate Simulation', function() {
            it('should be possible to terminate a running simulation', function(done) {
                agent
                .put('/simulations/0')
                .send({ state: 'Terminated'})
                .set('Acccept', 'application/json')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    done();
                });
            });
        });

        describe('Check Get Simulation By ID Valid State', function() {
            it('should be possible to get the first simulation by id and verify its new state', function(done) {
                agent
                .get('/simulations/0')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.user.name.should.equal('User Tester');
                    text.user.username.should.equal('user');
                    text.sim_id.should.be.exactly(0);
                    // state should now be terminated
                    text.state.should.equal('Terminated');
                    text.region.should.equal('US East');
                    text.world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Check One Simulation Left', function() {
            it('should be one running simulation with sim id 1', function(done) {
                agent
                .get('/simulations?state=Launching')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.length.should.be.exactly(1);
                    text[0].user.name.should.equal('User Tester');
                    text[0].user.username.should.equal('user');
                    text[0].sim_id.should.be.exactly(1);
                    text[0].state.should.equal('Launching');
                    text[0].region.should.equal('Ireland');
                    text[0].world.should.equal('blank_update.world');
                    done();
                });
            });
        });

        describe('Check One Simulation In History', function() {
            it('should be one simulation in history', function(done) {
                agent
                .get('/simulations?state=Terminated')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.length.should.be.exactly(1);
                    text[0].user.name.should.equal('User Tester');
                    text[0].user.username.should.equal('user');
                    text[0].sim_id.should.be.exactly(0);
                    text[0].state.should.equal('Terminated');
                    text[0].region.should.equal('US East');
                    text[0].world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Check Update Terminated Simulation by ID', function() {
            it('should not be able to update a terminated simulation', function(done) {
                agent
                .put('/simulations/0')
                .send({ world: 'empty_update.world', region:'europe' })
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.user.name.should.equal('User Tester');
                    text.user.username.should.equal('user');
                    text.sim_id.should.be.exactly(0);
                    text.state.should.equal('Terminated');
                    // region and world should remain unchanged.
                    text.region.should.equal('US East');
                    text.world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Check Get Updated Simulation History by ID', function() {
            it('should be possible to see the terminated simulation remain unchanged', function(done) {
                agent
                .get('/simulations/0')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.user.name.should.equal('User Tester');
                    text.user.username.should.equal('user');
                    text.sim_id.should.be.exactly(0);
                    text.state.should.equal('Terminated');
                    // region and world should remain unchanged.
                    text.region.should.equal('US East');
                    text.world.should.equal('empty.world');
                    done();
                });
            });
        });

        describe('Check Delete Simulation In History', function() {
            it('should be possible to delete a simulation in history', function(done) {
                agent
                .del('/simulations/0')
                .set('Acccept', 'application/json')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    done();
                });
            });
        });

        describe('Check Empty Simulation In History', function() {
            it('should be no more simulations in history', function(done) {
                agent
                .get('/simulations?state=Terminated')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.length.should.be.exactly(0);
                    done();
                });
            });
        });

        describe('Check Unauthorized Get Running Simulations', function() {
            it('should not be able to see running simulations', function(done) {
                var agentUnauthorized = supertest.agent(app);
                agentUnauthorized
                .get('/simulations?state=Launching')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(401);
                    done();
                });
            });
        });

        describe('Check Unauthorized Create Simulation', function() {
            it('should not be able to create simulations', function(done) {
                var agentUnauthorized = supertest.agent(app);
                agentUnauthorized
                .post('/simulations')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(401);
                    done();
                });
            });
        });

        describe('Check Unauthorized Get Simulation By ID', function() {
            it('should not be able to get simulations by id', function(done) {
                var agentUnauthorized = supertest.agent(app);
                agentUnauthorized
                .get('/simulations/1')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(401);
                    done();
                });
            });
        });

        describe('Check Unauthorized Terminate Simulation By ID', function() {
            it('should not be able to terminate running simulation by id', function(done) {
                var agentUnauthorized = supertest.agent(app);
                agentUnauthorized
                .put('/simulations/1')
                .send({ state: 'Terminated'})
                .set('Acccept', 'application/json')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(401);
                    done();
                });
            });
        });

        describe('Check Unauthorized Simulation History', function() {
            it('should not be able to see simulation history', function(done) {
                var agentUnauthorized = supertest.agent(app);
                agentUnauthorized
                .get('/simulations/?state=Terminated')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(401);
                    done();
                });
            });
        });

        describe('Check Second User', function () {
            it('Should be impossible for a user to see other sims', function(done) {
                supertest(app)
                .post('/users/session')
                .set('Acccept', 'application/json')
                .send({ email: 'user_test2@test.com', password:'pass2' })
                .end(function(err,res){
                    user2Cookie = res.headers['set-cookie'];
                    supertest(app).get('/simulations')
                    .set('cookie', user2Cookie)
                    .end(function(err, res) {
                        util.log_res(res);
                        var sims = JSON.parse(res.text);
                        sims.length.should.equal(0);
                        done();
                    });
                });
            });
        });

        describe('Check Second User Create Simulation', function() {
            it('should be possible to create a simulation for the second user', function(done) {
                supertest(app)
                .post('/simulations')
                .set('Acccept', 'application/json')
                .set('cookie', user2Cookie)
                .send({ world: 'shapes.world', region:'US West' })
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.sim_id.should.be.exactly(0);
                    text.state.should.equal('Launching');
                    text.region.should.equal('US West');
                    text.world.should.equal('shapes.world');
                    done();
                });
            });
        });

        describe('Check Second User One Simulation Created', function() {
            it('should be one running simulation', function(done) {
                supertest(app)
                .get('/simulations?state=Launching')
                .set('cookie', user2Cookie)
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    text.length.should.be.exactly(1);
                    text[0].user.name.should.equal('User Tester2');
                    text[0].user.username.should.equal('user2');
                    text[0].sim_id.should.be.exactly(0);
                    text[0].state.should.equal('Launching');
                    text[0].region.should.equal('US West');
                    text[0].world.should.equal('shapes.world');
                    done();
                });
            });
        });

        describe('Check Create Multiple Simulations With Unique ID', function() {
            it('should be possible to create simulations with unique ids', function(done) {
                var simCount = 0;
                var simTotal = 10;
                var simIds = [];
                var callback = function(err,res) {
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    var text = JSON.parse(res.text);
                    // check unique ids
                    simIds.should.not.contain(text.sim_id);
                    simIds.push(text.sim_id);
                    text.region.should.equal('US East');
                    text.world.should.equal('empty.world');
                    simCount++;
                    if (simCount === simTotal)
                        done();
                };
                for (var i = 0; i < simTotal; ++i) {
                    agent
                    .post('/simulations')
                    .set('Acccept', 'application/json')
                    .send({ world: 'empty.world', region:'US East' })
                    .end(callback);
                }
            });
        });

        after(function(done) {
            user.remove();
            user2.remove();
            done();
        });
    });
});
