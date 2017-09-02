var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');
const Token = require('../utils/token');
var async = require('async');

// 0 - Utilities

function internal_err_msg(err) {
    return '<h1>Internal Server Error</h1><br /><h5>' + err + '</h5>';
}

// 1 - Authorization free routes

router.all('*', (req, res, next) => {
    console.log('[' + req.method + ']', req.url, '-', req.ip);
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
    if (req.isAuthenticated() && req.user.email == target_email)
        return res.redirect('/profile');

    async.parallel({
        user: function(callback) {
            User.getByEmail({ email: target_email, getPw: false }, (err, user) => {
                return callback(err, user);
            })
        },
        followers: function (callback) {
            User.getFollowers(target_email, (err, followers) => {
                return callback(err, followers);
            })
        },
        following: function(callback) {
            User.getFollowing(target_email, (err, following) => {
                return callback(err, following);
            })
        },
        distance: function(callback) {
            if (req.isAuthenticated()) {
                User.getDistance(req.user.email, target_email, (err, dist) => {
                    console.log('returning distance!');
                    return callback(err, dist);
                });
            }
            else {
                return callback(null, null);
            }
        }
    }, function (err, results) {
        if (err) {
            console.error(err);
            return res.send(internal_err_msg(err));
        }

        res.render('limitedView.ejs', {
            fname: results.user['fname'],
            lname: results.user['lname'],
            bday: results.user['dob'],
            sex: results.user.sex ? 'female' : 'male',
            follower_data: results.followers,
            following_data: results.following,
            message: req.flash('viewMessage'),
            target_email: target_email,
            distance: results.distance,
            current_user_follows: results.dist == 1
        });
    });
});

// 2 - Authorization required routes

router.get('/profile', ensureAuthenticated, (req, res) => {
    // Fetch followers, following and notifications from DB in parallel
    async.parallel({
        followers: function(callback) {
            User.getFollowers(req.user.email, (err, result) => {
                return callback(err, result);
            }) 
        },
        following: function(callback) {
            User.getFollowing(req.user.email, (err, result) => {
                return callback(err, result);
            });
        },
        notifications: function (callback) {
            User.getNotifications(req.user.email, (err, result) => {
                return callback(err, result);
            });
        }
    }, function(err, results) {
        if (err) {
            console.error(err);
            return res.send(internal_err_msg(err));
        }
        
        const sex = req.user.sex ? "female" : "male";
        const params = {
            fname: req.user.fname,
            lname: req.user.lname,
            school: req.user.school,
            bday: req.user.dob,
            sex: sex,
            email: req.user.email,
            following: results.following,
            followers: results.followers,
            notifications: results.notifications,
            message: req.flash('profileMessage')
        };
        res.render('profile.ejs', params);
    });
});

router.get('/logout', ensureAuthenticated, (req, res) => {
    Token.consume(req.cookies['rememberMe'], (err, token) => {});
    res.clearCookie('rememberMe');
    req.logout();
    res.redirect('/');
});

router.get('/follow/:target_email', ensureAuthenticated, (req, res) => {
    var target_email = req.params.target_email;
    if (target_email == req.user.email) {
        req.flash('viewMessage', 'You cannot follow yourself');
        return res.redirect('/view/'+target);
    } else if (target_email == null) {
        req.flash('viewMessage', 'Cannot follow');
        return res.redirect('/view/' + target_email);
    } else {
        User.newFollow(req.user.email, target_email, function(err) {
            if (err) {
                console.error(err);
                req.flash('viewMessage', 'following failed');
                return res.redirect('/view/' + target_email);
            } else {
                req.flash('viewMessage', 'following success');
                return res.redirect('/view/' + target_email);
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
        req.flash('viewMessage', 'You cannot follow yourself');
        res.redirect('/view/'+target);
    } else if (target_email == null) {
        req.flash('viewMessage', 'Cannot follow');
        res.redirect('/view/' + target_email);
    } else {
        User.unfollow(req.user.email, target_email, function(err) {
            if (err) {
                console.log(err);
                req.flash('viewMessage', 'unfollowing failed');
                res.redirect('/view/' + target_email);
            } else {
                req.flash('viewMessage', 'unfollowed successfully');
                res.redirect('/view/' + target_email);
            }
        });
    }
});

router.get('/notifications', ensureAuthenticated, (req, res) => {
    User.getNotifications(req.user.email, (err, notifs) => {
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