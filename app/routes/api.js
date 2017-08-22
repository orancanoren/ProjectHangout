var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');

router.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
})

// MARK: AUTHENTICATION

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/api/profile',
    failureRedirect: '/api/badlogin',
    failureFlash: true
}));

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
                    res.send(JSON.stringify({
                        fname: req.user.properties.fname,
                        lname: req.user.properties.lname,
                        bday: req.user.properties.dob,
                        sex: req.user.properties.sex,
                        email: req.user.properties.email,
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