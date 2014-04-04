'use strict';


var should = require('should'),
    sockets = require('../../../app/lib/sockets');

var socketDict;

describe('Socket test', function() {
    describe('Socket dict', function() {
        before(function(done) {
            console.log('before');
            socketDict = sockets.getUserSockets();
            should.exist(socketDict);
            done();
        });

        describe('Adding connections', function() {
            it('Alice should have no sockets', function(done) {
                console.log('Test');

                var s = socketDict.getSockets('Alice');
                s.should.be.instanceof(Array).and.have.lengthOf(0);

                var callBackCount = 0;
                var mockSocket = {emit: function() {
                    callBackCount += 1;
                }};
                socketDict.addSocket('Alice', mockSocket);
                socketDict.notifyUser('Alice', 'message', {});
                callBackCount.should.equal(1);

                socketDict.removeSocket(mockSocket);
                socketDict.getSockets('Alice').should.be.instanceof(Array).and.have.lengthOf(0);
                socketDict.notifyUser('Alice', 'message', {});
                callBackCount.should.equal(1);  // no change
                done();
            });
        });
    });
});
