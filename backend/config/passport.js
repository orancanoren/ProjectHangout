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

	passport.deserializeUser((user, done) => {
		const email = user.email ? user.email : user;
		User.getByEmail({email: email, getPw: false }, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	(req, email, password, done) => {
		// asynchronous
		process.nextTick(() => {
			User.getByEmail({ email: email, getPw: true }, (err, user) => {
				// if there are any errors, return the error
				if (err)
					return done(err);
				// if no user is found, return the message
				if (!user) {
					console.log('user not found');
					return done(null, false, req.flash('loginMessage', 'Email not found'));
				}
				
				// Invalid credentials are provided
				else if (!User.validPassword(password, user.pwhash))
					return done(null, false, req.flash('loginMessage', 'Wrong password'));

				// All is well, return the user data without the password hash
				else {
					console.log('passport local-login - success');
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
		usernameField : 'email_input',
		passwordField : 'password_input',
		passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	function(req, email, password, done) {
		// asynchronous
		process.nextTick(() => {
			console.log('local signup got:\n', req.body);
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
				if (existingUser) {
					console.log('existing user');
					return done(null, false, req.flash('signupMessage', 'Email in use.'));
				}
					

				//  If the user is logged in, this means that the user is updating info
				if(req.user) {
					console.log('user logged in');
					return done(null, false, req.flash('signupMessage', 'Authenticated user cannot signup!'))
				}
					
				else {
					//  We're not logged in, so we're creating a brand new user.
					var pwHash = User.generateHash(password);
					User.addNewUser(fname, lname, email, bday, pwHash, sex, school, function (err, user) {
						console.log('adding new user');
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