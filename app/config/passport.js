var LocalStrategy   = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;

var UserController = require('../controllers/user');
var UserModel = require('../models/DB/User');
var NotificationModel = require('../models/DB/Notification');
var ActivationModel = require('../models/DB/UserActivation');
var neo4jDriver = require('./neo4j');

var User = new UserController(null, 
	NotificationModel, UserModel, ActivationModel, neo4jDriver);

// Mark: Passport configuration function
// expose this function to our app using module.exports
module.exports = function(passport) {

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((user, done) => {
		User.getProfile(user.id, (err, user) => {
			done(err, user);
		});
	});

	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'key',
		passwordField : 'password',
		passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	(req, key, password, done) => {
		User.login(key, password, (err, user) => {
			done(err, user);
		});
	}));

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'username',
		passwordField : 'password',
		passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	(req, email, password, done) => {
		User.register(username, req.body.email, password, (err, user) => {
			return done(err, user);
		})
	}));
};