'use strict';

//
// Module dependencies.
//
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    CloudsimUser = mongoose.model('CloudsimUser');

//Globals
var user, cloudsimUser;

//The tests
describe('<Unit Test>', function() {
    describe('Model CloudsimUser:', function() {
        before(function(done) {
            user = new User({
                name: 'User Tester',
                email: 'user_test@test.com',
                username: 'user',
                password: 'password',
                provider: 'local',
                open_id: 'openid'
            });
            user.save(function(err) {
                should.not.exist(err);
                cloudsimUser = new CloudsimUser({user: user.id});
                done();
            });
        });

        describe('Method Save', function() {
            it('should begin without the test user', function(done) {
                CloudsimUser.find({ user: user._id }, function(err, users) {
                    users.should.have.length(0);
                    done();
                });
            });

            it('should have a next_sim_id', function(done) {
                console.log(cloudsimUser);
                cloudsimUser.next_sim_id.should.equal(-1);
                done();
            });

            it('should be able to save without problems', function(done) {
                cloudsimUser.save(done);
            });

            it('should be possible to increment the sim id', function(done) {

                CloudsimUser.incrementNextSimId(user._id, function(err, cloudsimUser) {
                    var id = cloudsimUser.next_sim_id;
                    should.exist(id);
                    id.should.equal(0);
                    done();
                });

            });

        });

        after(function(done) {
            user.remove();
            cloudsimUser.remove();
            done();
        });
    });
});
