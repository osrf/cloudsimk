'use strict';

angular.module('mean.simulations').controller('SimulationsController', ['$scope', '$stateParams', '$location', 'Global', 'Simulations', function ($scope, $stateParams, $location, Global, Simulations) {
    $scope.global = Global;

    $scope.find = function() {
        Simulations.query(function(simulations) {
            $scope.simulations = simulations;
        });
    };

    $scope.findOne = function() {
        Simulations.get({
            sim_id: $stateParams.sim_id
        }, function(simulation) {
            $scope.simulation = simulation;
        });
    };
}]);
