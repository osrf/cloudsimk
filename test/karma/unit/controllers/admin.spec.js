'use strict';

(function() {
    describe('CloudSim controllers', function() {
        describe('AdminController', function() {
            // Load the controllers module
            beforeEach(module('cloudsim'));

            var scope, AdminController;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();

                AdminController = $controller('AdminController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function() {
                expect(scope.global).toBeTruthy();
            });
        });
    });
})();
