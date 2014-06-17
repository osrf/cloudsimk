'use strict';

/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    app = require('../../../server'),
    util = require('../util');

console.log('app type: ' + typeof app);

var supertest = require('supertest');

var cookie;
var user;
var agent;

// Create a separate test where a user has not been inserted in the
// database before the tests run.
describe('No user in DB:', function() {
    describe('Invalid user add', function() {
        it('should be impossible to add a user when not authenticated', function(done) {
            agent = supertest.agent(app);
            console.log('HERE');
            agent.post('/users')
                .set('Accept', 'application/json')
                .send({ email: 'user_test@test.com', open_id:'test',
                        username: 'test', name: 'test' })
                .end(function(err, res){
                    util.log_res(res);
                    res.should.have.status(200);
                    res.redirect.should.equal(false);
                    res.body.error.message.should.equal(
                        'Only administrators can add users');
                    done();
                });
        });
    });
});



describe('<Unit Test>', function() {
    describe('Model User:', function() {
        before(function(done) {
            user = new User({
                open_id: 'myopenid',
                name: 'User Tester',
                email: 'user_test@test.com',
                username: 'user',
                password: 'pass',
                provider: 'local'
            });
            user.save(done);
        });


        describe('Bad login', function() {
            it('should be impossible to login as a random user', function(done) {
                agent = supertest.agent(app);
                agent
                    .post('/users/session')
                    .set('Acccept', 'application/json')
                    .send({ email: 'random@test.com', password:'secret' })
                    .end(function(err,res){
                        util.log_res(res);
                        // 302 Moved Temporarily  200 OK
                        res.should.have.status(302);
                        res.redirect.should.equal(true);
                        res.headers.location.should.equal('/signin');
                        done();
                    });
            });
        });

        describe('Is not logged in', function() {
            it('There should not be a user', function(done) {
                agent
                .get('/users/me')
                .end(function(err,res){
                    util.log_res(res);
                    // 302 Moved Temporarily  200 OK
                    res.should.have.status(200);
                    // cookie = res.headers['set-cookie'];
                    res.text.should.equal('null');
                    done();
                });
            });
        });

        describe('Local login', function() {
            it('should be possible to login as the test user', function(done) {
                agent
                .post('/users/session')
                .set('Acccept', 'application/json')
                .send({ email: 'user_test@test.com', password:'pass' })
                .end(function(err,res){
                    // 302 Moved Temporarily  200 OK
                    res.should.have.status(302);
                    cookie = res.headers['set-cookie'];
                    util.log_res(res);
                    res.redirect.should.equal(true);
                    res.headers.location.should.equal('/');
                    done();
                });
            });
        });

        describe('Is logged in', function() {
            it('There should be a user', function(done) {
                agent
                .get('/users/me')
                .end(function(err,res){
                    util.log_res(res);
                    // 302 Moved Temporarily  200 OK
                    res.should.have.status(200);
                    // cookie = res.headers['set-cookie'];
                    res.text.should.not.equal('null');
                    done();
                });
            });
        });

        after(function(done) {
            console.log('removing user: ' + user.email);
            user.remove();
            done();
        });
    });
});

