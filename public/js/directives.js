'use strict';

/////////////////////////////////////////////////
// Displays a boost-style error message
angular.module('cloudsim').directive('cloudsimAlert', function() {
    return {
        restrict: 'E',
        scope: {
            error: '=error'
        },
        templateUrl: '/views/templates/alert.html'
    };
});

/////////////////////////////////////////////////
// Validate an ssh-key
angular.module('cloudsim').directive('sshKey', function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
          ctrl.$parsers.unshift(function(viewValue) {
            if (viewValue !== undefined &&
                viewValue.substring(0,24) == "ssh-rsa AAAAB3NzaC1yc2EA") {
              ctrl.$setValidity('ssh_key', true);
              return viewValue;
            } else {
              ctrl.$setValidity('ssh_key', false);
              return undefined;
            }
          });
        }
    };
});
