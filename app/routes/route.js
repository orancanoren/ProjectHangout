var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');
const Token = require('../utils/token');
var async = require('async');
var reactDOM = require('react-dom');
var path = require('path');

// 0 - Utilities

function internal_err_msg(err) {
    return '<h1>Internal Server Error</h1><br /><h5>' + err + '</h5>';
}

// 1 - Authorization free routes

router.all('*', (req, res, next) => {
    console.log('[' + req.method + ']', req.url, '-', req.ip);
    next();
});

router.route('/')
    .get( (req, res) => {
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
                            res.sendFile(path.join(__dirname, '../../views/', 'index.html'));
                        }
                    }
                })
            }
            else {
                res.sendFile(path.join(__dirname, '../../views/', 'index.html'));
            }
        }
      })
    .post( passport.authenticate('local-login', {
        failureFlash: true,
        failureRedirect: '/'
    }), (req, res, next) => {
        console.log(req.body);
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
                });
            }
            res.redirect('/profile');
        }
});

router.route('/signup')
    .post((req, res, next) => { ( passport.authenticate('local-signup', {
            successRedirect: '/profile',
            failureRedirect: '/signup',
            failureFlash: true })) 
    })
    .get((req, res, next) => {
        res.redirect('/');
    })

// 2 - Authorization required routes

router.get(['/profile', '/search', '/view/:mail'], ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/', 'authorized.html'));
});

router.get('/logout', ensureAuthenticated, (req, res) => {
    Token.consume(req.cookies['rememberMe'], (err, token) => {});
    res.clearCookie('rememberMe');
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();

    return res.status(401).redirect('/');
}

module.exports = router;