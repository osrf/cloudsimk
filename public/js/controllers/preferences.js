'use strict';

angular.module('cloudsim.preferences').controller('PreferencesController', ['$scope', '$stateParams', '$location', 'Global', 'Users', function ($scope, $stateParams, $location, Global, Users) {
    $scope.global = Global;

}]);
