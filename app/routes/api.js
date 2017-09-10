var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');
var Token = require('../utils/token');
var async = require('async');

function internal_err_msg(err) {
    return '<h1>Internal Server Error</h1><br /><h5>' + err + '</h5>';
}

router.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
})

// MARK: AUTHENTICATION

router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/api/badlogin'
        }),
        (req, res, next) => {
            // 1 - Set (or don't set) remember me cookie
            console.log('/api login got req.body:\n', req.body);
            if (req.body.rememberMe != 'yes') return next();

            Token.issue(req.user, (err, token) => {
                if (err) return next(err);
                console.log('rememberMe cookie set!');
                res.cookie('rememberMe', token, {
                    path: '/',
                    httpOnly: true,
                    maxAge: 604800000
                });
                return next();
            });
        },
        (req, res) => {
            res.json({
                success: true
            });
        }
);

router.get('/badlogin', (req, res) => {
    res.json({
        message: "Invalid credentials"
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
            return res.json({ error: internal_err_msg(err) });
        }
        res.json({
            fname: results.user['fname'],
            lname: results.user['lname'],
            bday: results.user['dob'],
            sex: results.user.sex ? 'female' : 'male',
            followers: results.followers,
            following: results.following,
            school: results.user.school,
            distance: results.distance,
            current_user_follows: results.dist == 1,
            bio: results.user.bio
        });
    });
});

router.get('/card/:target_email', (req, res) => {
    const self_email = req.user ? req.user.email : null;
    User.getCardData(req.params.target_email, self_email, (err, results) => {
        if (err) {
            res.json({
                error: err
            });
        }
        else {
            res.json(results);
        }
    });
});

router.post('/search', (req, res) => {
    User.searchByName(req.body.search_query, (err, result) => {
        if (err) {
            console.error(err);
            res.json({
                error: err
            });
        }
        else {
            res.json(result);
        }
    });
});

router.get('/profile/:email?', (req, res) => {
    var email;
    if (!req.params.email) {
        if (!req.user) {
            return res.json({ error: 'Not authenticated'});
        }
        email = req.user.email;
    }
    else {
        email = req.params.email;
    }

    async.parallel({
        followers: function(callback) {
            User.getFollowers(email, (err, result) => {
                return callback(err, result);
            }) 
        },
        following: function(callback) {
            User.getFollowing(email, (err, result) => {
                return callback(err, result);
            });
        },
        cardData: function(callback) {
            User.getCardData(email, (req.user && email != req.user.email) ? 
                                req.user.email : null, (err, result) => {
                return callback(err, result);
            });
        }
    }, function(err, results) {
        if (err) {
            console.error(err);
            return res.send(internal_err_msg(err));
        }
        
        const sex = req.user.sex ? "female" : "male";
        res.json({
            fname: results.cardData.fname,
            lname: results.cardData.lname,
            school: results.cardData.school,
            bday: results.cardData.dob,
            sex: sex,
            following: results.following,
            followers: results.followers
        });
    });
});

router.get('/notifications', ensureAuthenticated, (req, res) => {
    User.getNotifications(req.user.email, (err, results) => {
        if (err) {
            res.json({
                error: err
            });
        }
        else {
            res.json({
                notifications: results
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
                    success: true
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
                console.error(err);
                res.json({
                    error: err,
                    success: false
                });
            } else {
                res.json({
                    success: true
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

router.get('/mydata/:data', (req, res) => {
    res.json({
        data: req.params.data
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