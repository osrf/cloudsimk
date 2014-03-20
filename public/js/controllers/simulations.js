'use strict';

angular.module('mean.simulations').controller('SimulationsController', ['$scope', '$stateParams', '$location', 'Global', 'Simulations', function ($scope, $stateParams, $location, Global, Simulations) {
    $scope.global = Global;

    /// All the worlds available to the user.
    // TODO: Retrieve this list from the server.
    $scope.worlds = ['Empty', 'SimpleShapes', 'PR2', 'Atlas'];

    /// All the regions available to the user.
    // TODO: Retrieve this list from the server.
    $scope.regions = ['US East', 'US West', 'Ireland'];

    /// Launch a simulation.
    $scope.launch = function() {

        var simulation = new Simulations({
            world: $scope.world,
            region: $scope.region
        });
        simulation.$save(function(response) {
            $location.path('simulations/' + response._id);
        });
    };

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
