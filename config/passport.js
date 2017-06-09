var LocalStrategy   = require('passport-local').Strategy;

var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {
	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		User.get(id, function(err, user) {
			if (err) return next(err);
			done(err, user);
		});
	});

	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'email_input',
		passwordField : 'password_input',
		passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	function(req, email, password, done) {
		// asynchronous
		process.nextTick(function() {
			User.getBy('user.localEmail', email, function(err, user) {
				// if there are any errors, return the error
				if (err)
					return done(err);

				// if no user is found, return the message
				if (!user)
					return done(null, false, req.flash('loginMessage', 'Invalid email'));

				if (!User.validPassword(password, user.properties.localPassword))
					return done(null, false, req.flash('loginMessage', 'Wrong password.'));

				// all is well, return user
				else {
					return done(null, user);
				}
			});
		});
	}));

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	function(req, email, password, done) {
		// asynchronous
		process.nextTick(function() {
			var fname = req.body.fname;
			var lname = req.body.lname;
			var bday = req.body.bday;
			//  Whether we're signing up or connecting an account, we'll need
			//  to know if the email address is in use.
			User.getBy('user.localEmail', email, function(err, existingUser) {
				// if there are any errors, return the error
				if (err){
					console.log(err);
					return done(err);
				}

				// check to see if there's already a user with that email
				if (existingUser) {
					return done(null, false, req.flash('signupMessage', 'That email is already in use.'));
				}

				//  If the user is logged in, this means that the user is updating info
				if(req.user) {
					var update = {};
						update.id = req.user._id;
						update.props = {};
							update.props.localEmail = email;
							update.props.localPassword = User.generateHash(password);
							update.props.fname = fname;
							update.props.lname = lname;
							update.props.bday = bday;
					User.update(update, function(err, user) {
						if (err)
							throw err;
						return done(null, user);
					});
				} else {
					//  We're not logged in, so we're creating a brand new user.
					// create the user
					var newUser = {};
						newUser.localEmail = email;
						newUser.localPassword = User.generateHash(password);
						newUser.fname = fname;
						newUser.lname = lname;
						newUser.bday = bday;
					User.create(newUser, function (err, user) {
						if (err)
							return next(err);
						return done(null, user);
					});
				}
			});
		});
	}));
};