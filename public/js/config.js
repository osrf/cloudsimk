'use strict';

// Setting up route
angular.module('mean').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // For unmatched routes:
    $urlRouterProvider.otherwise('/');

    // states for my app
    $stateProvider
/*      .state('all simulations', {
        url: '/simulations',
        templateUrl: 'views/simulations/list.html'
    })
    */
      .state('create simulation', {
        url: '/simulations/create',
        templateUrl: 'views/simulations/create.html'
    })
      /*.state('simulation by id', {
        url: '/simulations/:simulationId',
        templateUrl: 'views/simulations/view.html'
    })*/
      .state('home', {
        url: '/',
        templateUrl: 'views/index.html'
    });
}
]);

// Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
}
]);
