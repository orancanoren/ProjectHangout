var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');
const Token = require('../utils/token');

// 0 - Utilities

const err500 = '<h1>Internal Server Error</h1><br />';

var rememberMe_auth = function(req, res, next) {
    if (!req.body.rememberMe) return next();
    console.log('req wants to issue a remmeberMe token');

    Token.issue(req.user, (err, token) => {
        if (err) { 
            console.error(err);
            return next(err);
        }
        res.cookie('rememberMe', token, {
            path: '/',
            httpOnly: true,
            maxAge: 604800000 // 7 days
        });
        return next();
    });
}

// 1 - Authorization free routes

router.route('/')
    .get( (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            res.render('index.ejs', { message: req.flash('loginMessage') });
        }
      })
    .post( passport.authenticate('local-login', {
        failureFlash: true
    }), (req, res, next) => {
        if (req.isAuthenticated()) {
            //rememberMe_auth(req, res, next);
            console.log('redirecting to /profile');
            res.redirect('/profile');
        } else {
            console.log('user not authenticated');
            res.redirect('/');
        }
    });


router.route('/signup')
      .get( (req, res) => {
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        }
      })
      .post( (req, res) => {
        passport.authenticate('local-signup', {
            successRedirect: '/profile',
            failureRedirect: '/signup',
            failureFlash: true
        });
      });

router.route('/search')
      .post( (req, res) => {
        const target = req.body.search_query;
        User.searchByName(target, (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send(err500 + '<h5>Error in searchByName()</h5>');
            }
            else {
                res.render('search', {
                    search_query: target,
                    search_results: results
                });
            }
        });
    });

router.get('/view/:target_email', (req, res) => {
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
                    console.error(err);
                    res.status(500).send(err500 + '<h4>Cannot retrieve follower data</h4>');
                } else {
                    User.getFollowing(target_email, function(err, following_data) {
                        if (err) {
                            console.error(err);
                            res.status(500).send(err500 + '<h4>Cannot retrieve following data</h4>');
                        }
                        if (req.isAuthenticated()) {
                            User.getDistance(req.user.email, target_email, (err, distance) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send(err500 + '<h4>Cannot retrieve the distance of users</h4>');
                                }
                                var dist = null;
                                if (distance.dist) {
                                    dist = distance.dist;
                                }
                                const sex = user.sex ? 'female' : 'male';
                                res.render('limitedView.ejs', {
                                    fname: user['fname'],
                                    lname: user['lname'],
                                    bday: user['dob'],
                                    sex: sex,
                                    follower_data: follower_data,
                                    following_data: following_data,
                                    message: req.flash('limitedViewMessage'),
                                    target_email: target_email,
                                    distance: dist
                                });
                            });
                        }
                        else {
                            res.render('limitedView.ejs', {
                                fname: user['fname'],
                                lname: user['lname'],
                                bday: user['dob'],
                                sex: user['sex'],
                                follower_data: follower_data,
                                following_data: following_data,
                                message: req.flash('limitedViewMessage'),
                                target_email: target_email,
                                distance: null
                            });
                        }
                    });
                }
            });
        }
    });
});

// 2 - Authorization required routes

router.get('/profile', ensureAuthenticated, (req, res) => {
    // TODO: Manage async clearly w/Streamline.js
    console.log('inside profile!');
    User.getFollowers(req.user.email, function(err, followers) {
        if (err) {
            console.error('ERROR: Couldn\'t get followers');
            //res.status(500).send(err500 + '<h5>Error in getFollowers()</h5>');
        } else {
            console.log('obtained followers');
            User.getFollowing(req.user.email, function(err, following) {
                if (err) {
                    console.error('ERROR: Couldn\'t get following');
                    //res.status(500).send(err500 + '<h5>Error in getFollowing()</h5>');
                } else {
                    console.log('obtained following');
                    const sex = req.user.sex ? "female" : "male";
                    console.log('rendering profile.ejs!');
                    res.render('profile.ejs', {
                        fname: req.user.fname,
                        lname: req.user.lname,
                        school: req.user.school,
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

router.get('/logout', ensureAuthenticated, (req, res) => {
    res.clearCookie('rememberMe');
    req.logout();
    res.redirect('/');
});

router.get('/follow/:target_email', ensureAuthenticated, (req, res) => {
    var target_email = req.params.target_email;
    if (target_email == req.user.email) {
        req.flash('limitedViewMessage', 'You cannot follow yourself');
        return res.redirect('/view/'+target);
    } else if (target_email == null) {
        req.flash('profileMessage', 'Cannot follow');
        return res.redirect('/profile');
    } else {
        User.newFollow(req.user.email, target_email, function(err) {
            if (err) {
                console.error(err);
                req.flash('profileMessage', 'following failed');
                return res.redirect('/profile');
            } else {
                req.flash('profileMessage', 'following success');
                return res.redirect('/profile');
            }
        });
    }
});

router.get('/ungollow/:target_email', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    }

    var target_email = req.params.target_email;
    if (target_email == req.user.email) {
        req.flash('limitedViewMessage', 'You cannot follow yourself');
        res.redirect('/view/'+target);
    } else if (target_email == null) {
        req.flash('profileMessage', 'Cannot follow');
        res.redirect('/profile');
    } else {
        User.unfollow(req.user.email, target_email, function(err) {
            if (err) {
                console.log(err);
                req.flash('profileMessage', 'unfollowing failed');
                res.redirect('/profile');
            } else {
                req.flash('profileMessage', 'unfollowed successfully');
                res.redirect('/profile');
            }
        });
    }
});

// 3 - 404

router.all('*', (req, res) => {
    console.log('404:', req.method, req.url);
    res.render('404.ejs', {
        url: req.url
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();

    return res.status(401).redirect('/');
}

module.exports = router;