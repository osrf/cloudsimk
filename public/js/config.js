'use strict';

// Setting up route
angular.module('cloudsim').config(['$stateProvider', '$urlRouterProvider',
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
    // Route to the admin view
    .state('admin', {
        url: '/admin',
        templateUrl: 'views/users/admin.html'
    })
    .state('preferences', {
        url: '/preferences',
        templateUrl: 'views/users/preferences.html'
    })
    .state('home', {
        url: '/',
        templateUrl: 'views/index.html'
    });

}
]);

// Setting HTML5 Location Mode
angular.module('cloudsim').config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
}
]);
