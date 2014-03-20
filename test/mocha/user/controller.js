'use strict';

/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    app = require('../../../server');

console.log('app type: ' + typeof app);

var supertest = require('supertest');
var util = require('util');

var cookie;
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
    console.log('everything: ' + util.inspect(res));
}

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
                        log_res(res);
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
                    log_res(res);
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
                    log_res(res);
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
                    log_res(res);
                    // 302 Moved Temporarily  200 OK
                    res.should.have.status(200);
                    // cookie = res.headers['set-cookie'];
                    res.text.should.not.equal('null');
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

