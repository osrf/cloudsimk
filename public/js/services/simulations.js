'use strict';

// Simulations service used for simulations REST endpoint
angular.module('cloudsim.simulations').factory('Simulations', ['$resource', function($resource) {
    return $resource('simulations/:simulationId', {}, {
        query:  {method: 'GET', params:{simulationId:'', state:''}, isArray: true},
        post:   {method: 'POST'},
        update: {method: 'PUT', params: {simulationId: '@simulationId'}},
        remove: {method: 'DELETE'}
    });
}]);

/*globals io*/
var socket = io.connect();
angular.module('cloudsim.simulations').factory('Topic', function() {
  function Topic(options) {
    options = options || {};
  }
  // \brief Every time a message is published for the given topic, the callback
  // will be called with the message object.
  // \param callback - function with the following params:
  //   * message - the published message
  Topic.prototype.subscribe = function(topic, callback) {
    socket.on(topic, function(_msg) {
      callback(_msg);
    });
  };

  return Topic;
});
