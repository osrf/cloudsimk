'use strict';

// Users service used for users REST endpoint
angular.module('cloudsim').factory('Users', ['$resource', function($resource) {
    return $resource('users/:userId', {}, {
        query:  {method: 'GET', params:{userId:'@open_id'}, isArray: true},
        me:     {method: 'GET', url:'users/me'},
        post:   {method: 'POST'},
        update: {method: 'PUT', params: {userId: '@open_id'}},
        remove: {method: 'DELETE', params: {userId: '@open_id'}}
    });
}]);
