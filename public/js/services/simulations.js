'use strict';

// Simulations service used for simulations REST endpoint
angular.module('cloudsim.simulations').factory('Simulations', ['$resource', function($resource) {
    return $resource('simulations/:simulationId', {}, {
        query:  {method: 'GET', params:{simulationId:'', state:''}, isArray: true},
        post:   {method: 'POST'},
        update: {method: 'PUT', params: {simulationId: '@simulationId'}},
        remove: {method: 'DELETE', params: {simulationId: '@simulationId'}}
    });
}]);

/*globals io*/
var socket = io.connect();
angular.module('cloudsim.simulations').factory('Topic', function() {
  function Topic(options) {
    options = options || {};
  }

  // Subcribe to a topic published by the server.
  Topic.prototype.subscribe = function(topic, callback) {
    socket.on(topic, function(_msg) {
      callback(_msg);
    });
  };

  return Topic;
});
