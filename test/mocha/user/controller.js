'use strict';

/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    app = require('../../../server');

console.log('app type: ' + typeof app);

var supertest = require('supertest');

var cookie;
var user;
var agent;

// function log_res(res) {
//     var cookie = res.headers['set-cookie'];
//     console.log('cookie: ' + cookie);
//     console.log('body: %j',  res.body);
//     console.log('redirects: ' + res.redirects.length);
//     console.log('text: ' + res.text);
//     // console.log('everything: ' + util.inspect(res)); 
// }

describe('<Unit Test>', function() {
    describe('Model User:', function() {
        before(function(done) {
            user = new User({
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
                        // log_res(res);
                        // 302 Moved Temporarily  200 OK
                        res.should.have.status(302);
                        res.text.should.equal(
                            'Moved Temporarily. Redirecting to /signin');
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
                    // log_res(res); 
                    res.text.should.equal('Moved Temporarily. Redirecting to /');
                    done();
                });
            });
        });

        describe('Is logged in', function() {
            it('There should be a user', function(done) {
                agent
                .get('/')
                .end(function(err,res){
                    // 302 Moved Temporarily  200 OK
                    res.should.have.status(200);
                    console.log('res.user: ' + res.user);
                    cookie = res.headers['set-cookie'];
                    // log_res(res); 
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

