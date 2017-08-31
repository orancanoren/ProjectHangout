var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');
var Token = require('../utils/token');

router.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
})

// MARK: AUTHENTICATION

router.post('/login', passport.authenticate('local-login', {
        failureFlash: true,
        failureRedirect: '/api/badlogin'
        }),
        (req, res, next) => {
            // 1 - Set (or don't set) remember me cookie
            if (!req.body.remember_me) return next();

            Token.issue(req.user, (err, token) => {
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
            // 2 - Redirect to profile
            res.redirect('/api/profile');
        }
);

router.get('/badlogin', (req, res) => {
    res.json({
        error: "Invalid credentials"
    });
});

router.post('/signup', passport.authenticate('local-signup', { 
    failureFlash: true,
    failureRedirect: '/api/badsignup'    
    }),
    (req, res) => {
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        }
        else {
            res.json({
                error: "Not authenticated after signup, something gone wrong"
            });
        }
    }
);

router.get('/badsignup', (req, res) => {
    res.json({
        error: "Error during signup"
    });
})

/* TODO
Async function calls make the code unreadable, find
a better way to deal with these
*/

router.get('/view/:target_email', (req, res) => {
    const target_email = req.params.target_email;
    if (req.isAuthenticated() && req.user.email == target_email)
        return res.redirect('/api/profile');

    User.getByEmail(target_email, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: err500,
                description: 'Error in getByEmail()'
            });
        }
        if (!user) {
            if (!req.isAuthenticated()) {
                req.flash('loginMessage', 'User doesn\'t exist');
                res.json({
                    error: 'User not found'
                });
            } else {
                req.flash('profileMessage', 'User doesn\'t exist');
                res.redirect('/api/profile');
            }
        } else {
            User.getFollowers(target_email, function(err, follower_data) {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        error: err500,
                        description: 'Error in getFollowers()'
                    });
                } else {
                    User.getFollowing(target_email, function(err, following_data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                error: err500,
                                description: 'Error in getFollowing()'
                            });
                        }
                        if (req.isAuthenticated()) {
                            User.getDistance(req.user.email, target_email, (err, distance) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send(err500 + '<h4>Cannot retrieve the distance of users</h4>');
                                }
                                res.json({
                                    fname: user['fname'],
                                    lname: user['lname'],
                                    bday: user['dob'],
                                    sex: user['sex'],
                                    follower_data: follower_data,
                                    following_data: following_data,
                                    message: req.flash('limitedViewMessage'),
                                    target_email: target_email,
                                    distance: distance,
                                    current_user_follows: distance == 1
                                });
                            });
                        }
                        else {
                            res.json({
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

router.post('/search', (req, res) => {
    const search_query = req.body.search_query;
    User.searchByName(search_query, (err, result) => {
        if (err) {
            console.error(err);
            res.json({
                error: 'Error in searchByName()',
                description: err
            });
        }
        else {
            res.json(result);
        }
    });
});

router.get('/profile', ensureAuthenticated, (req, res) => {

    User.getFollowers(req.user.email, function(err, followers) {
        if (err) {
            res.status(500).send(JSON.stringify({error: err}));
        } else {
            User.getFollowing(req.user.email, function(err, following) {
                if (err) {
                    res.status(500).send(JSON.stringify({error: err}));
                } else {
                    User.getNotifications(req.user.email, false, (err, notifs) => {
                        if (err) {
                            res.status(500).send(JSON.stringify({error: err}));
                        }
                        else {
                            const sex = req.user.sex ? "female" : "male";
                            res.send({
                                fname: req.user.fname,
                                lname: req.user.lname,
                                bday: req.user.dob,
                                sex: sex,
                                email: req.user.email,
                                following: following,
                                followers: followers,
                                notifications: notifs,
                                message: req.flash('profileMessage')
                            });
                        }
                    });
                   
                }
            });
        }
    });
});

router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    res.send({
        message: "logout success",
        success: true
    });
});

router.post('/follow', ensureAuthenticated, (req, res) => {
    var target_email = req.body.target_email;
    if (target_email == req.user.email) {
        res.json({
            error: 'You cannot follow yourself',
            success: false
        });
    } else if (target_email == null) {
        res.json({
            error: 'Follow target not specified',
            success: false
        });
    } else {
        User.newFollow(req.user.email, target_email, function(err) {
            if (err) {
                console.log(err);
                res.json({
                    error: err,
                    success: false
                });
            } else {
                res.json({
                    succes: true
                });
            }
        });
    }
});

router.post('/unfollow/', ensureAuthenticated, (req, res) => {
    var target_email = req.body.target_email;
    if (target_email == req.user.email) {
        res.json({
            error: 'You cannot unfollow yourself',
            success: false
        });
    } else if (target_email == null) {
        res.json({
            error: 'Unfollow target not specified',
            success: false
        });
    } else {
        User.unfollow(req.user.email, target_email, function(err) {
            if (err) {
                console.log(err);
                res.json({
                    error: err,
                    success: false
                });
            } else {
                res.json({
                    succes: true
                });
            }
        });
    }
});

router.post('/event', ensureAuthenticated, (req, res) => {
    const eventObject = {
        title: req.body.title,
        place: req.body.place,
        host_email: req.user.email,
        start_time: req.body.start_time,
        end_time: req.body.end_time
    };

    User.newEvent(eventObject, (err) => {
        if (err) {
            console.log(err);
            res.json({
                error: err
            });
        }
        else {
            res.json({
                success: true
            });
        }
    });
});

// 404

router.all('*', (req, res) => {
    res.status(404);
    res.send(JSON.stringify({
        error: "invalid URL"
    }));
});

// Utilities

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.json({
        error: "not authenticated"
    });
}

module.exports = router;