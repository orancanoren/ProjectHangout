var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');

router.use('*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
})

router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        res.send(JSON.stringify({
            error: "not authenticated"
        }));
    }
    res.send(JSON.stringify({
        email: req.user.properties.email,
        bday: req.user.properties.bday,
        name: (req.user.properties.fname + " " + req.user.properties.lname)
    }));
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/api/profile',
    failureRedirect: '/api/badlogin',
    failureFlash: true
}));

router.get('/badlogin', (req, res) => {
    res.send(JSON.stringify({
        error: "invalid credentials"
    }));
})

module.exports = router;