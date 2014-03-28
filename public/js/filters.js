'use strict';

// A filter that allows a table to display items starting at a certain
// value.
// For an exmaple, see public/view/user/admin.html
angular.module('cloudsim.tableFilters', []).filter('startFrom', function() {
    return function(input, start){
        return input.slice(start);
    };
});
