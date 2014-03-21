'use strict';

angular.module('mean.simulations').controller('SimulationsController', ['$scope', '$stateParams', '$location', 'Global', 'Simulations', 'SimulationsRunning', function ($scope, $stateParams, $location, Global, Simulations, SimulationsRunning) {
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
        SimulationsRunning.query(function(simulations) {
           //  var simulationItems = [];
           //  for (var i = 0; i < simulations.length; ++i) {
           //      var simulationItem = {};
           //      simulationItem.selected = false;
           //      simulationItem.id = simulations[i].sim_id;
           //      simulationItem.world = simulations[i].world;
           //      simulationItem.state = simulations[i].state;
           //      simulationItem.region = simulations[i].region;
           //      simulationItem.uptime = 0;
           //      simulationItem.cost = 0;
           //      simulationItems.push(simulationItem);
           //  }
            $scope.simulations = simulations;
            for (var i = 0; i < simulations.length; ++i) {
                simulations[i].selected = false;
            }

            console.log("first sim " + $scope.simulations[0].region);
        });
    };

    $scope.findOne = function() {
        Simulations.get({
            sim_id: $stateParams.sim_id
        }, function(simulation) {
            $scope.simulation = simulation;
        });
    };

    $scope.selectAllSimulations = function() {
        for (var i = 0; i < $scope.simulations.length; ++i)
            $scope.simulations[i].selected = $scope.simulationsChecked;
    };
}]);
