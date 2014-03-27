'use strict';

angular.module('mean.simulations').controller('SimulationsController', ['$scope', '$stateParams', '$location', '$modal', 'Global', 'Simulations', function ($scope, $stateParams, $location, $modal, Global, Simulations) {
    $scope.global = Global;

    /// All the worlds available to the user.
    // TODO: Retrieve this list from the server.
    $scope.worlds = ['Empty', 'SimpleShapes', 'PR2', 'Atlas'];

    /// All the regions available to the user.
    // TODO: Retrieve this list from the server.
    $scope.regions = ['US East', 'US West', 'Ireland'];

    /// Get all the running simulations.
    $scope.simulations = Simulations.query();

    /// The current page of simulations
    $scope.currentPage = 1;

    /// Number of simulations to diplay per page
    $scope.simPerPage = 5;

    /// Launch a simulation.
    $scope.launch = function() {
        var sim = new Simulations({
            sim_id: 0,
            state: 'Launching',
            region: $scope.launch.region,
            world: $scope.launch.world
        });
        sim.$save();
        sim.selected = false;
        $scope.simulations.unshift(sim);
    };


    var getShutdownButtonActive = function () {
      return ($scope.getPageSimulations().length > 0) ? '' : 'disabled';
    }


    var shutdownDialog = null;
    $scope.showShutdownDialog = function () {
        shutdownDialog = $modal.open({
            templateUrl: 'shutdown.html',
            controller: shutdownDialogCtrl
        });

        shutdownDialog.result.then(function () {
            var currentPageSims = $scope.getPageSimulations();
            var selected = currentPageSims.filter(function(sim) {
              return sim.selected === true;
            });

            for (var i = 0; i < selected.length; ++i) {
                console.log ('selected state ' + selected[i].state);
                selected[i].state = 'Terminated';
                // shutdown machine here
            }
        }, function () {});
    };

    $scope.getPageSimulations = function() {
        var start = ($scope.currentPage-1)*$scope.simPerPage;
        var end = start + $scope.simPerPage;
        return $scope.simulations.slice(start, end);
    }

    var shutdownDialogCtrl = function ($scope, $modalInstance) {
        $scope.confirmShutdown = function (terminate) {
            if (terminate) {
                $modalInstance.close();
            }
            else {
                $modalInstance.dismiss();
            }
        };
    };

}]);
