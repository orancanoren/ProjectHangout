var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');
const Token = require('../utils/token');

const err500 = '<h1>Internal Server Error</h1><br />';

// LOGIN
router.get('/', function(req, res) { // home page
    if (req.isAuthenticated()) {
        res.redirect('/profile');
    } else {
        passport.authenticate('remember-me');
        res.render('index.ejs', { message: req.flash('loginMessage') });
    } 
});

router.post('/', passport.authenticate('local-login', {
        failureRedirect: '/',
        failureFlash: true 
    }), 
    (req, res, next) => {
        //if (!req.body.remember_me) return next();

        Token.issueToken(req.user, (err, token) => {
            if (err) return next(err);
            res.cookie('remember_me', token, {
                path: '/',
                httpOnly: true,
                maxAge: 604800000 // 7 days
            });
            return next();
        });
    },
        (req, res) => {
            res.redirect('/');
        }
    );

// SIGNUP
router.get('/signup', function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/profile');
    } else {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    }
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

// LIMITED PROFILE VIEW
router.get('/view/:target_email', function(req, res) {
    var target_email = req.params.target_email;
    if (req.isAuthenticated() && req.user.email == target_email) {
        res.redirect('/profile');
        return;
    }

    User.getByEmail(target_email, function(err, user) {
        if (err) {
            console.error(err);
            res.status(500).send(err500 + '<h4>Error during getByEmail()<h4>');
        }
        if (!user) {
            if (!req.isAuthenticated()) {
                req.flash('loginMessage', 'User doesn\'t exist');
                res.redirect('/');
            } else {
                req.flash('profileMessage', 'User doesn\'t exist');
                res.redirect('/profile');
            }
        } else {
            User.getFollowers(target_email, function(err, follower_data) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err500 + '<h4>Cannot retrieve follower data</h4>');
                } else {
                    User.getFollowing(target_email, function(err, following_data) {
                        if (err) {
                            console.log(err);
                            res.status(500).send(err500 + '<h4>Cannot retrieve following data</h4>');
                        }
                        res.render('limitedView.ejs', {
                            fname: user['fname'],
                            lname: user['lname'],
                            bday: user['dob'],
                            sex: user['sex'],
                            follower_data: follower_data,
                            following_data: following_data,
                            message: req.flash('limitedViewMessage'),
                            target_email: target_email
                        });
                    });
                }
            });
        }
    });
});

router.get('/profile', function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    }
    // TODO: Manage async clearly w/Streamline.js
    User.getFollowers(req.user.email, function(err, followers) {
        if (err) {
            console.log('ERROR: Couldn\'t get followers');
            res.status(500).send(err500 + '<h5>Error in getFollowers()</h5>');
        } else {
            User.getFollowing(req.user.email, function(err, following) {
                if (err) {
                    console.log('ERROR: Couldn\'t get following');
                    res.status(500).send(err500 + '<h5>Error in getFollowing()</h5>');
                } else {
                    const sex = req.user.sex ? "female" : "male";
                    res.render('profile.ejs', {
                        fname: req.user.fname,
                        lname: req.user.lname,
                        bday: req.user.dob,
                        sex: sex,
                        email: req.user.email,
                        following: following,
                        followers: followers,
                        message: req.flash('profileMessage')
                    });
                }
            });
        }
    });
});

router.get('/logout', function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    }
    res.clearCookie('remember_me');
    req.logout();
    res.redirect('/');
});

router.get('/follow/:target_email', function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    }

    var target_email = req.params.target_email;
    console.log(req.user.email + ' wants to follow ' + target_email);
    if (target_email == req.user.email) {
        req.flash('limitedViewMessage', 'You cannot follow yourself');
        res.redirect('/view/'+target);
    } else if (target_email == null) {
        req.flash('profileMessage', 'Cannot follow');
        res.redirect('/profile');
    } else {
        User.newFollow(req.user.email, target_email, function(err, rel) {
            if (err) {
                console.log(err);
                req.flash('profileMessage', 'following failed');
                res.redirect('/profile');
            } else {
                console.log(rel);
                req.flash('profileMessage', 'following success');
                res.redirect('/profile');
            }
        });
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.status(401).redirect('/login');
}

module.exports = router;