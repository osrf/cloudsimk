'use strict';

/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    app = require('../../../server'),
    util = require('../util');

console.log('app type: ' + typeof app);

var supertest = require('supertest');

var user;
var agent;

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
                    done();
                });
            });
        });

        describe('Check Empty Running Simulation', function() {
            it('should be no running simulations at the beginning', function(done) {
                agent
                .get('/simulations/running')
                .end(function(err,res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    JSON.parse(res.text).length.should.be.exactly(0);
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
                    util.log_res(res);
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

