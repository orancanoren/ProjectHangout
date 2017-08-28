var LocalStrategy   = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;
var User = require('../app/models/user');
const Token = require('../app/utils/token');

// Mark: Passport configuration function
// expose this function to our app using module.exports
module.exports = function(passport) {

	passport.serializeUser((user, done) => {
		// embed the id to the session
		done(null, user.email);
	});

	passport.deserializeUser((email, done) => {
		User.getByEmail(email, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'email_input',
		passwordField : 'password_input',
		passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	(req, email, password, done) => {
		console.log('inside passport.local-login');
		// asynchronous
		process.nextTick(() => {
			User.getByEmail(email, (err, user) => {
				// if there are any errors, return the error
				console.log('inside getbyemail');
				if (err)
					return done(err);
				// if no user is found, return the message
				if (!user)
					return done(null, false, req.flash('loginMessage', 'Email not found'));
				
				// Invalid credentials are provided
				else if (!User.validPassword(password, user.pwhash))
					return done(null, false, req.flash('loginMessage', 'Wrong password'));

				// All is well, return the user data without the password hash
				else {
					return done(null, user);
				}
			});
		});
	}));

	passport.use('remember-me', new RememberMeStrategy((token, done) => {
		Token.consume(token, (err, email) => {
			if (err) return done(err);
			if (!email) return done(null, false);

			User.getByEmail(email, (err, user) => {
				if (err) return done(err);
				if (!user) return done(err, false);
				return done(null, user);
			});
		}
	)}, Token.issue
	));

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'email_input',
		passwordField : 'password_input',
		passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	function(req, email, password, done) {
		// asynchronous
		process.nextTick(() => {
			var fname = req.body.fname;
			var lname = req.body.lname;
			var bday = req.body.bday;
			var sex = req.body.sex;
			var school = req.body.school;

			User.checkEmail(email, function(err, existingUser) {
				// if there are any errors, return the error
				if (err) {
					console.error(err);
					return done(err);
				}

				// check to see if there's already a user with that email
				if (existingUser)
					return done(null, false, req.flash('signupMessage', 'Email in use.'));

				//  If the user is logged in, this means that the user is updating info
				if(req.user)
					return done(null, false, req.flash('signupMessage', 'Authenticated user cannot signup!'))
				else {
					//  We're not logged in, so we're creating a brand new user.
					var pwHash = User.generateHash(password);
					User.addNewUser(fname, lname, email, bday, pwHash, sex, school, function (err, user) {
						if (err) {
							console.error(err);
							return done(err);
						} else {
							return done(null, user);
						}
					});
				}
			});
		});
	}));
};