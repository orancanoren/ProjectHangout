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
            res.redirect('/');
        }
);

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/api/profile',
    failureRedirect: '/api/badsignup',
    failureFlash: true
}));

router.get('/badlogin', (req, res) => {
    res.send(JSON.stringify({
        error: "invalid credentials"
    }));
});

router.get('/badsignup', (req, res) => {
    res.send(JSON.stringify({
        error: "error during signup"
    }));
});

router.get('/not_authenticated', (req, res) => {
    res.send(JSON.stringify({
        error: "not authenticated"
    }));
});

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
        if (!user) {
            if (!req.isAuthenticated()) {
                req.flash('loginMessage', 'User doesn\'t exist');
                res.redirect('/api/');
            } else {
                req.flash('profileMessage', 'User doesn\'t exist');
                res.redirect('/api/profile');
            }
        } else {
            User.getFollowers(target_email, function(err, follower_data) {
                if (err) {
                    console.log(err);
                    res.status(500).json(JSON.stringify({
                        error: err500,
                        description: 'Error in getFollowers()'
                    }));
                } else {
                    User.getFollowing(target_email, function(err, following_data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json(JSON.stringify({
                                error: err500,
                                description: 'Error in getFollowing()'
                            }));
                        }
                        const response_obj = {
                            fname: user['fname'],
                            lname: user['lname'],
                            bday: user['dob'],
                            sex: user['sex'] ? "female" : "male",
                            follower_data: follower_data,
                            following_data: following_data,
                            message: req.flash('limitedViewMessage'),
                            target_email: target_email
                        };
                        console.log('responding with\n', response_obj);
                        res.json(JSON.stringify(response_obj));
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
            res.json(JSON.stringify({
                error: 'Error in searchByName()',
                description: err
            }));
        }
        else {
            console.log('search results:', result);
            res.json(result[0]);
        }
    });
});

// MARK: AUTHENTICATED BEYOND THIS POINT (except for 404)

router.get('/profile', isLoggedIn, (req, res) => {

    User.getFollowers(req.user._id, function(err, followers) {
        if (err) {
            console.log('ERROR: Couldn\'t get followers');
            res.status(500).send(JSON.stringify({error: err}));
        } else {
            User.getFollowing(req.user._id, function(err, following) {
                if (err) {
                    console.log('ERROR: Couldn\'t get following');
                    res.status(500).send(JSON.stringify({error: err}));
                } else {
                    const sex = req.user.sex ? "female" : "male";
                    res.send(JSON.stringify({
                        fname: req.user.fname,
                        lname: req.user.lname,
                        bday: req.user.dob,
                        sex: sex,
                        email: req.user.email,
                        following: following,
                        followers: followers,
                        message: req.flash('profileMessage')
                    }))
                }
            });
        }
    });
});

router.get('/logout', isLoggedIn, (req, res) => {
    isLoggedIn(req, res, "not authenticated");

    req.logout();
    res.send(JSON.stringify({
        message: "logout success"
    }));
});

// 404

router.get('*', (req, res) => {
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