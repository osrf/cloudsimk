'use strict';

(function() {
    describe('CloudSim controllers', function() {
        describe('IndexController', function() {
            // Load the controllers module
            beforeEach(module('cloudsim'));

            var scope, IndexController;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();

                IndexController = $controller('IndexController', {
                    $scope: scope
                });
                
            }));

            it('should expose some global scope', function() {
                expect(scope.global).toBeTruthy();
            });

            // The global user should not be authenticated.
            it('should not be authenticated', function() {
                expect(scope.global.authenticated).toBe(false);
            });
        });
    });
})();
