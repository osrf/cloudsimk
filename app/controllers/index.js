'use strict';

exports.render = function(req, res) {
    // The following set the global user variable.
    // See also app/views/index.html
    res.render('index', {
        user: req.user ? JSON.stringify(req.user) : 'null'
    });
};
