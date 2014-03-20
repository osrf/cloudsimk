var util = require('util');

exports.log_res = function(res, verbose) {
    if (!verbose)
        return;
    var cookie = res.headers['set-cookie'];
    console.log('cookie: ' + cookie);
    console.log('body: %j',  res.body);
    console.log('redirects: ' + res.redirects.length);
    console.log('text: ' + res.text);
    console.log('everything: ' + util.inspect(res));
}
