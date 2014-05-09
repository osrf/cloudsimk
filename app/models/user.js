'use strict';

/// Module dependencies.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/// User Schema
var UserSchema = new Schema({
    /// OpenID string
    open_id: {
        type: String,
        required: true
    },

    /// Name of the user
    name: {
        type: String,
        required: true
    },

    /// User's email address
    email: String,

    /// User's username.
    username: {
        type: String,
        unique: true
    },

    /// The ID of the next simulation instance the user will run
    next_sim_id: {
        type: Number,
        default: 0
    },

    /// The user's password
    hashed_password: String,

    /// The user's password provider
    provider: String,

    /// TODO: describe this
    salt: String,

    /// Google authentication
    google: {},

    /// Yahoo authentication
    yahoo: {},

    /// AOL authentication
    aol: {},

    /// AOL authentication
    openid: {},

    credit: {
      type: Number,
      default: 0
    },

    invites: {
      type: Number,
      default: 0
    },

    ssh_keys: [ {
      label: String,
      date: Date,
      key: String,
    }]
});

/// Virtuals
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password;
});

/// Validations
var validatePresenceOf = function(value) {
    return value && value.length;
};

// The 4 validations below only apply if you are signing up traditionally.
UserSchema.path('name').validate(function(name) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    if (!this.provider) return true;
    return (typeof name === 'string' && name.length > 0);
}, 'Name cannot be blank');

UserSchema.path('email').validate(function(email) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    if (!this.provider) return true;
    return (typeof email === 'string' && email.length > 0);
}, 'Email cannot be blank');

UserSchema.path('username').validate(function(username) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    if (!this.provider) return true;
    return (typeof username === 'string' && username.length > 0);
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function(hashed_password) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    if (!this.provider) return true;
    return (typeof hashed_password === 'string' && hashed_password.length > 0);
}, 'Password cannot be blank');


/// Pre-save hook
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password) && !this.provider)
        next(new Error('Invalid password'));
    else
        next();
});

/// Methods
UserSchema.methods = {
    ///  Authenticate - check if the passwords are the same
    ///
    ///  @param {String} plainText
    ///  @return {Boolean}
    ///  @api public
    authenticate: function(plainText) {
        var authenticated = false;
        if( this.encryptPassword(plainText) === this.hashed_password) {
            authenticated = true;
        }
        return authenticated;
    },

    ///  Make salt
    ///
    ///  @return {String}
    ///  @api public
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    ///  Encrypt password
    ///
    ///  @param {String} password
    ///  @return {String}
    ///  @api public
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

/////////////////////////////////////////////////
// Statics
UserSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('User', UserSchema);
