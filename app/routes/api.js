var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');

router.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
})

// MARK: AUTHENTICATION

router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/api/badlogin',
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
            res.redirect('/api/profile');
        }
);

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/api/profile',
    failureRedirect: '/api/badsignup',
    failureFlash: true
}));

/* TODO 
Handle badlogin and badsignup properly later!
No need for seperate routes
*/

router.get('/badlogin', (req, res) => {
    res.json({
        error: "invalid credentials"
    });
});

router.get('/badsignup', (req, res) => {
    res.json({
        error: "error during signup"
    });
});

router.get('/not_authenticated', (req, res) => {
    res.json({
        error: "not authenticated"
    });
});

/* TODO
Async function calls make the code unreadable, find
a better way to deal with these
*/

router.get('/view/:target_email', (req, res) => {
    const target_email = req.params.target_email;
    if (req.isAuthenticated() && req.user.email == target_email) {
        res.redirect('/api/profile');
        return;
    }

    User.getByEmail(target_email, function(err, user) {
        if (err) {
            console.error(err);
            res.status(500).json(JSON.stringify({
                error: err500,
                description: 'Error in getByEmail()'
            }));
        }
        console.log('getByEmail result user:', user);
        if (!user) {
            console.log('!user');
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
                                res.render('limitedView.ejs', {
                                    fname: user['fname'],
                                    lname: user['lname'],
                                    bday: user['dob'],
                                    sex: user['sex'],
                                    follower_data: follower_data,
                                    following_data: following_data,
                                    message: req.flash('limitedViewMessage'),
                                    target_email: target_email,
                                    distance: distance
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

/* TODO
/search queries the DB for every request,
instead perform caching and indexing to reduce DB access
*/
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

// MARK: AUTHENTICATED BEYOND THIS POINT (except for 404)

router.get('/profile', isLoggedIn, (req, res) => {

    User.getFollowers(req.user.email, function(err, followers) {
        if (err) {
            console.log('ERROR: Couldn\'t get followers');
            res.status(500).send(JSON.stringify({error: err}));
        } else {
            User.getFollowing(req.user.email, function(err, following) {
                if (err) {
                    console.log('ERROR: Couldn\'t get following');
                    res.status(500).send(JSON.stringify({error: err}));
                } else {
                    const sex = req.user.sex ? "female" : "male";
                    res.send({
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

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    res.send({
        message: "logout success",
        success: true
    });
});

router.get('/follow/:target_email', isLoggedIn, (req, res) => {
    var target_email = req.params.target_email;
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

router.get('/unfollow/:target_email', isLoggedIn, (req, res) => {
    var target_email = req.params.target_email;
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
})

router.post('/event', isLoggedIn, (req, res) => {
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
})
// 404

router.all('*', (req, res) => {
    res.status(404);
    res.send(JSON.stringify({
        error: "invalid URL"
    }));
})

// Utilities

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/api/not_authenticated');
}

module.exports = router;