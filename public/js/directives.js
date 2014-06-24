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

angular.module('MyModule', []).directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
            iElement.autocomplete({
                source: scope[iAttrs.uiItems],
                select: function() {
                    $timeout(function() {
                      iElement.trigger('input');
                    }, 0);
                }
            });
    };
});


