var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');
const Token = require('../utils/token');

// 0 - Utilities

const err500 = '<h1>Internal Server Error</h1><br />';

// 1 - Authorization free routes

var getProfileData = function(req, res, next) {

}

router.all('*', (req, res, next) => {
    console.log('[' + req.method + ']', req.url);
    next();
})

router.route('/')
    .get( (req, res) => {
        console.log('Current tokens:\n', Token.tokens);
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            // 1 - Check if there exists a remember-me cookie
            const token = req.cookies.rememberMe;
			if (token) {
				Token.consume(token, (err, user_email) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send(err500 + '<h4>Error during token auth</h4>');
                    }
                    else {
                        if (user_email) {
                            var user = {};
                            user.email = user_email;
                            req.login(user, (err) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send(err500 + '<h4>Error during req.login()</h4>');
                                }
                                else {
                                    res.redirect('/profile');
                                }
                            });
                        }
                        else {
                            res.render('index.ejs', { message: req.flash('loginMessage') });
                        }
                    }
                })
            }
            else {
                res.render('index.ejs', { message: req.flash('loginMessage') });
            }
        }
      })
    .post( passport.authenticate('local-login', {
        failureFlash: true,
        failureRedirect: '/'
    }), (req, res, next) => {
        if (req.isAuthenticated()) {
            req.body.rememberMe = true; // for DEBUG
            if (req.body.rememberMe) {
                Token.issue(req.user.email, (err, token) => {
                    if (err) { 
                        console.error(err);
                        return done(err);
                    }
                    res.cookie('rememberMe', token, {
                        path: '/',
                        httpOnly: true,
                        maxAge: 604800000 // 7 days
                    });
                    console.log('token', token, ' issued!');
                });
            }
            res.redirect('/profile');
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
      .post( passport.authenticate('local-signup', {
            successRedirect: '/profile',
            failureRedirect: '/signup',
            failureFlash: true
        }));

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
                        const sex = user.sex ? 'female' : 'male';
                        if (err) {
                            console.error(err);
                            res.status(500).send(err500 + '<h4>Cannot retrieve following data</h4>');
                        }
                        if (req.isAuthenticated()) {
                            User.getDistance(req.user.email, target_email, (err, distance) => {
                                console.log('/view got the distance result:\n', distance);
                                if (err) {
                                    console.error(err);
                                    res.status(500).send(err500 + '<h4>Cannot retrieve the distance of users</h4>');
                                }
                                var dist = null;
                                if (distance.dist) {
                                    dist = distance.dist;
                                }
                                
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
                                sex: sex,
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
    User.getFollowers(req.user.email, function(err, followers) {
        if (err) {
            res.status(500).send(err500 + '<h5>Error in getFollowers()</h5>');
        } else {
            User.getFollowing(req.user.email, function(err, following) {
                if (err) {
                    res.status(500).send(err500 + '<h5>Error in getFollowing()</h5>');
                } else {
                    User.getNotifications(req.user.email, false, (err, notifs) => {
                        const sex = req.user.sex ? "female" : "male";
                        const params = {
                            fname: req.user.fname,
                            lname: req.user.lname,
                            school: req.user.school,
                            bday: req.user.dob,
                            sex: sex,
                            email: req.user.email,
                            following: following,
                            followers: followers,
                            notifications: notifs,
                            message: req.flash('profileMessage')
                        };
                        res.render('profile.ejs', params);
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

router.get('/unfollow/:target_email', (req, res) => {
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

router.get('/notifications', ensureAuthenticated, (req, res) => {
    User.getNotifications(req.user.email, false, (err, notifs) => {
        if (err) {
            res.send(err500 + '<h4>Error in getNotifications()</h4>');
        }
        else {
            res.render('notifications.ejs', {
                notifications: notifs
            });
        }
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();

    return res.status(401).redirect('/');
}

module.exports = router;