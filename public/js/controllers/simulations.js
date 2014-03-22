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
            $scope.simulations = simulations;
            for (var i = 0; i < simulations.length; ++i) {
                simulations[i].selected = false;
            }
            $scope.currentPage = 0;
            $scope.groupToPages();
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

    $scope.gap = 5;
    $scope.groupedItems = [];
    $scope.itemsPerPage = 5;
    $scope.pagedItems = [];
    $scope.currentPage = 0;

    $scope.groupToPages = function () {
        $scope.pagedItems = [];
        for (var i = 0; i < $scope.simulations.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.simulations[i] ];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.simulations[i]);
            }
        }
    };

    $scope.range = function (size,start, end) {
        var ret = [];
        // console.log(size,start, end);

        if (size < end) {
            end = size;
            start = size-$scope.gap;
        }
        start = Math.max(start, 0);
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        // console.log(ret);
        return ret;
    };

    $scope.setPage = function(n) {
        if (n >= 0 && n < $scope.pagedItems.length)
            $scope.currentPage = n;
    };

    // Tabs
    var tabClasses;

    function initTabs() {
        tabClasses = ['','','',''];
    }

    $scope.getTabClass = function (tabNum) {
        return tabClasses[tabNum];
    };

    $scope.getTabPaneClass = function (tabNum) {
        return 'tab-pane fade ' + tabClasses[tabNum];
    };

    $scope.setActiveTab = function (tabNum) {
        initTabs();
        tabClasses[tabNum] = 'in active';
    };

    //Initialize tabs
    initTabs();
    $scope.setActiveTab(1);
}]);
