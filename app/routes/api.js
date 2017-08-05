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

// MARK: AUTHENTICATED BEYOND THIS POINT (except for 404)

router.get('/profile', (req, res) => {
    isLoggedIn(req, res, "not authenticated");
    
    res.send(JSON.stringify({
        email: req.user.properties.email,
        bday: req.user.properties.bday,
        name: (req.user.properties.fname + " " + req.user.properties.lname)
    }));
});

router.get('/logout', (req, res) => {
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

function isLoggedIn(req, res, errmsg) {
    if (!req.isAuthenticated()) {
        res.send(JSON.stringify({
            error: errmsg
        }));
    }
}

module.exports = router;