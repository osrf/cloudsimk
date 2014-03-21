'use strict';

angular.module('mean.users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Global', 'Users', function ($scope, $stateParams, $location, Global, Users) {
    $scope.global = Global;

    $scope.addUser = function() {
        console.log($scope.email);
        var user = new Users({
            email: $scope.email,
            open_id: $scope.email,
            name: $scope.email
        });

        user.$save(function(response) {
            console.log('Add user response');
            console.log(response);
            $location.path('users/' + response._id);
        });
    };

    $scope.find = function() {
        Users.query(function(users) {
            $scope.users = users;
        });
    };

    $scope.findOne = function() {
        Users.get({
            email: $stateParams.email
        }, function(user) {
            $scope.user = user;
        });
    };
}]);
