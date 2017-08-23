var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');

// LOGIN
router.get('/', function(req, res) { // home page
    if (req.isAuthenticated()) {
        res.redirect('/profile');
    } else {
        res.render('index.ejs', { message: req.flash('loginMessage') });
    } 
});

router.post('/', passport.authenticate('local-login', {
        failureRedirect: '/',
        failureFlash: true 
    }),
    (req, res, next) => {
        if (!req.body.remember_me) return next();

        issueToken(req.user, (err, token) => {
            if (err) return next(err);
            res.cookie('remember_me', token, {
                path: '/',
                httpOnly: true,
                maxAge: 604800000
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
router.get('/view/:id', function(req, res) {
    var targetId = parseInt(req.params.id);
    if (req.isAuthenticated() && req.user._id == targetId) {
        res.redirect('/profile');
        return;
    }
    User.getByUserId(targetId, function(err, user) {
        if (err == "getByUserId(): user not found!") {
            if (!req.isAuthenticated()) {
                req.flash('loginMessage', 'User doesn\'t exist');
                res.redirect('/');
            } else {
                req.flash('profileMessage', 'User doesn\'t exist');
                res.redirect('/profile');
            }
        }
        else if (err) {
            console.log(err);
            res.status(500).send("<h1>Internal Server Error</h1>");
        } else {
            User.getFollowers(targetId, function(err, follower_data) {
                if (err) {
                    console.log(err);
                    res.status(500).send('<h1>Internal Server Error</h1>\
                    <h5>Cannot retrieve follower data</h5>');
                } else {
                    User.getFollowing(targetId, function(err, following_data) {
                        if (err) {
                            console.log(err);
                            res.status(500).send('<h1>Internal Server Error</h1>\
                            <h5>Cannot retrieve following data</h5>');
                        }
                        res.render('limitedView.ejs', {
                            fname: user.properties['fname'],
                            lname: user.properties['lname'],
                            bday: user.properties['dob'],
                            sex: user.properties['sex'],
                            follower_data: follower_data,
                            following_data: following_data,
                            message: req.flash('limitedViewMessage'),
                            id: targetId
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
            res.status(500).send("<h1>Internal Server Error</h1>");
        } else {
            User.getFollowing(req.user.email, function(err, following) {
                if (err) {
                    console.log('ERROR: Couldn\'t get following');
                    res.status(500).send("<h1>Internal Server Error</h1>");
                } else {
                    res.render('profile.ejs', {
                        fname: req.user.fname,
                        lname: req.user.lname,
                        bday: req.user.dob,
                        sex: req.user.sex,
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

router.get('/follow/:id', function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    }

    var target = parseInt(req.params.id);
    var selfId = parseInt(req.user._id);
    console.log(selfId + ' wants to follow ' + target);
    if (target == selfId) {
        console.log('same');
        req.flash('limitedViewMessage', 'You cannot follow yourself');
        res.redirect('/view/'+target);
    } else if (target == null) {
        req.flash('profileMessage', 'Cannot follow');
        res.redirect('/profile');
    } else {
        User.newFollow(selfId, target, function(err, rel) {
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