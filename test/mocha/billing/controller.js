'use strict';

/// Module dependencies.
var mongoose = require('mongoose'),
    Billing = mongoose.model('Billing'),
    CloudsimUser = mongoose.model('CloudsimUser'),
    User = mongoose.model('User');
// this is the billing controller
var billCtrl = require('../../../app/controllers/billing');
var should = require('should');

var user;
var cloudsimuser;

function cleanDb(cb) {
    console.log('clean DB');
    User.remove({}, function(err) {
        if(err) cb(err);
        CloudsimUser.remove({}, function(err) {
            if(err) cb(err);
            Billing.remove({}, function(err) {
                cb(err);
            });
        });
    });
}

describe('<Unit Test>', function() {
    describe('Billing a user:', function() {
        before(function(done) {
            cleanDb(function(err){
                should.not.exist(err);   
                user = new User({
                    open_id: 'myopenid',
                    name: 'User Tester',
                    email: 'user_test@test.com',
                    username: 'user',
                    password: 'pass',
                    provider: 'local'
                });
                user.save(function() {
                     cloudsimuser = new CloudsimUser({user: user._id});
                     cloudsimuser.save(function(err){
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });


        describe('Billing cost', function() {
            var costPerHourInCents = 100;
            it('should be 0 when due date is in the future', function(done) {
                var inaMinute = new Date( Date.now() + 60 *1000);
                var b = billCtrl.charge(inaMinute, costPerHourInCents);
                b.chargeInCents.should.equal(0);
                done();
            });
            it('should be 100 when due date is now', function(done) {
                var b = billCtrl.charge(new Date(), costPerHourInCents);
                b.chargeInCents.should.equal(100);
                done();
            });

            it('should be good for another hour', function(done) {
                var now = new Date();
                var b = billCtrl.charge(now, costPerHourInCents);
                var sec = 0.001 * (b.validUntil.getTime() - now);
                sec.should.equal(3600);
                done();
            });

            it('should be 400 when due date 3hrs and 1 min in the past', function(done) {
                var now = new Date();
                var moreThanThreeHoursAgo = new  Date( now.getTime() - ( 3 * 3600 * 1000 ) - 60 * 1000 );
                var b = billCtrl.charge(moreThanThreeHoursAgo, costPerHourInCents);
                b.chargeInCents.should.equal(400);

                // validity should be for an hour or less (from now)
                var  sec = 0.001 * (b.validUntil.getTime() - now);
                sec.should.be.below(3600);
                // validity should have increased 4 hrs
                var chargedSec = 0.001 * (b.validUntil.getTime() - moreThanThreeHoursAgo);
                chargedSec.should.equal(3600 * 4);
                done();
            });

            it('should increase with top up an account', function(done) {
                // give a fiver ($5)
                billCtrl.accountDeposit(user._id, 500, 'test top up',  function(err, newBalance) {
                    should.not.exist(err);
                    newBalance.should.equal(500);
                    done();
                });
            });

            it('should increase again', function(done) {
                // give ($2.50)
                billCtrl.accountDeposit(user._id, 250, 'test top up 2',  function(err, newBalance) {
                    should.not.exist(err);
                    newBalance.should.equal(750);
                    done();
                });
            });
            it('should be audited in billing documents', function(done) {
                // see two deposits ($5 and a $2.5)
                Billing.find({user:user._id,}).exec(function(err, billings) {
                    should.not.exist(err);
                    billings.length.should.equal(2);
                    billings[0].amount.should.equal(500);
                    billings[1].amount.should.equal(250);
                    billings[1].balance.should.equal(750);
                    done();
                });
            });
           
             it('should decrease with withdrawal', function(done) {

                billCtrl.accountWithdrawal(user._id, 700, 
                                           '7hr of PR2 on sim 22 (aws i-23345)',
                                            function (err, newBalance) {
                    should.not.exist(err);
                    newBalance.should.equal(50);
                    done();
                });
            });

           it('should be possible to withdraw more than available if the balance is positive', function(done) {
                // we have 50 left, but withdrawing 100
                billCtrl.accountWithdrawal(user._id, 100, 
                                           '1hr of PR2 on sim 22 (aws i-23345)',
                                            function (err, newBalance) {
                    should.not.exist(err);
                    newBalance.should.equal(-50);
                    done();
                });
            });

        });



        after(function(done) {
            console.log('removing user: ' + user.email);
            user.remove();
            cloudsimuser.remove();
            done();
        });
    });
});

