'use strict';
/// @module users_controller
/// Server side users controller


/// Module dependencies.
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    CloudsimUser = mongoose.model('CloudsimUser'),
    email = require('emailjs/email');

/////////////////////////////////////////////////
/// Authentication callback
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Authentication callback.
exports.authCallback = function(req, res) {
    res.redirect('/#!/');
};

/////////////////////////////////////////////////
/// Show login form
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.all = function(req, res) {

    if (!req.user) {
        res.send(500, 'Invalid permissions.');
        return;
    }

    // Get all simulation models, in creation order, for a user
    User.find().sort('-created') //.populate('user', 'name username')
      .exec(function(err, users) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(users);
        }
    });
};

/////////////////////////////////////////////////
/// Show login form
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};

/////////////////////////////////////////////////
/// Show sign up form
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/////////////////////////////////////////////////
/// Logout
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/////////////////////////////////////////////////
/// Session
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.session = function(req, res) {
    res.redirect('/');
};

/////////////////////////////////////////////////
/// Update a user
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Function to create a user.
exports.update = function(req, res) {
    var user = req.profile;

    // Find the user.
    User.findOne({open_id: user.open_id}).exec(function(err, usr) { 
        if (err) {
            res.jsonp({ error:
                        {message: 'Unable to find CloudSim user info' }});
        } else {
            CloudsimUser.findFromUserId(user._id, function(err, cloudsimUser) {
              if (err) {
                  res.jsonp({ error:
                              {message: 'Unable to find CloudSim user info' }});
              } else {

                  if (req.body.admin !== null) {
                     cloudsimUser.admin = req.body.admin;
                  }
                  if (req.body.credit !== null) {
                      cloudsimUser.credit = req.body.credit;
                  }
                  if (req.body.invites !== null) {
                      cloudsimUser.invites = req.body.invites;
                  }
                  if (req.body.ssh_keys !== null) {
                      cloudsimUser.ssh_keys = req.body.ssh_keys;
                  }
                  if (req.body.spent_warning !== null) {
                      cloudsimUser.spent_warning = req.body.spent_warning;
                  }
                  if (req.body.balance_warning !== null) {
                      cloudsimUser.balance_warning = req.body.balance_warning;
                  }

                  // Save the user to the database
                  cloudsimUser.save(function(err) {
                      if (err) {
                          return res.jsonp({error: {
                              message: 'Unable to update user',
                              user: cloudsimUser
                             }
                          });
                      } else {
                          var result = merge(usr, cloudsimUser);
                          // Send back the user
                          // (expected by angularjs on success).
                          return res.jsonp(result);
                      }
                  });
              }
            });
        }
    });
}


/////////////////////////////////////////////////
/// Remove user
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Function to create a user.
exports.remove = function(req, res) {
    var user = req.profile;

    if (user.email === req.user.email) {
        res.send(500, 'Unable to delete yourself');
        return;
    }
   
    user.remove(function(err) {
        if (err) {
            res.jsonp({ error: {
                message: 'Unable to delete user'
            }});
        }
        else {
            CloudsimUser.findFromUserId(user._id, function(err, cloudsimUser) {
                if(err) {
                    res.jsonp({ error: {message: 'Unable to find CloudSim user info' }});
                } else {
                    cloudsimUser.remove(function(err) {
                        if(err) {
                            res.jsonp({ error: {message: 'Unable to erase CloudSim user info' }});    
                        } else {
                            res.jsonp(user);
                        }
                    });
                }
            });
        }
    });
};

/////////////////////////////////////////////////
/// Create user
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @return Function to create a user.
exports.create = function(req, res) {
    var message = null;

    // Make sure the requesting user is authenticated.
    // todo: Add in check for admin privelages.
    if (!req.user || !req.user.open_id)
    {
        var err = {error: {
            message: 'Only administrators can add users',
            user: 'n/a'
        }};
        return res.jsonp(err);
    }

    // Make sure the requesting user is in the database.
    // TODO: We need to implement user privileges.
    User.findOne({open_id: req.user.open_id}, function(err) {
        if (!err) {
            // Create a new user based on the value in the request object
            var user = new User(req.body);
            user.provider = 'local';

            // Save the user to the database
            user.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                            message = 'Username already exists';
                            break;
                        default:
                            message = 'Please fill all the required fields';
                    }
    
                    return res.jsonp({error: {
                        message: message,
                        user: user
                    }
                    });
                }
                else {
                    var cloudsimUser = new CloudsimUser({user: user._id});
                    cloudsimUser.save(function(err) {
                        if(err) {
                            return res.jsonp({error: {
                                message: 'Error creating CloudSim user data',
                                user: user
                                }
                            });
                        } else {
                            // Send back the user (expected by angularjs on success).
                            return res.jsonp(user);
                        }
                    });
                }
            });
        }
        else {
            return res.jsonp({error: {
                message: 'Only administrators can add users',
                user: 'n/a'
            }});
        }
    });
};

/////////////////////////////////////////////////
/// Send User
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};

/////////////////////////////////////////////////
/// Find user by openid
/// @param[in] req Nodejs request object.
/// @param[out] res Nodejs response object.
/// @param[in] next The next Nodejs function to be executed.
/// @param[in] id The openid of the user to retrieve.
exports.user = function(req, res, next, id) {
    // Use mongo's findOne function to get a user based on the openid value
    User.findOne({
        open_id: id
    })
    // The function to execute when the user is found.
    .exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));

        // Store the user information in the request's profile
        req.profile = user;

        // Pass control to the next middleware
        next();
    });
};
