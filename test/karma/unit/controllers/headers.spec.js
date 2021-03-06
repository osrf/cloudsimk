'use strict';

(function() {
    describe('CloudSim controllers', function() {
        describe('HeaderController', function() {
            // Load the controllers module
            beforeEach(module('cloudsim'));

            var scope, HeaderController;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();

                HeaderController = $controller('HeaderController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function() {
                expect(scope.global).toBeTruthy();
            });

            it('should not be authenticated', function() {
                expect(scope.global.authenticated).toBe(false);
            });

        });
    });
})();
