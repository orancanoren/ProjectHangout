var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user');

module.exports = function(app, passport) {
    // LOGIN
    app.get('/', function(req, res) { // home page
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            res.render('index.ejs', { message: req.flash('loginMessage') });
        } 
    });

    app.post('/', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/',
        failureFlash: true
    }));

    // SIGNUP
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    // LIMITED PROFILE VIEW
    app.get('/view/:id', function(req, res) {
        var targetId = req.params.id;
        User.get(parseInt(targetId), function(err, user) {
            if (err == "user not found") {
                req.flash('loginMessage', 'User doesn\'t exist');
                res.redirect('/');
            }
            else if (err) {
                console.log(err);
                res.status(500).send("<h1>Internal Server Error</h1>");
            } else {
                var fname = user['fname'];
                var lname = user['lname'];
                var bday = user['bday'];

                User.getFollowCounts(parseInt(targetId), function(err, counts) {
                    if (err) {
                        console.log(err);
                        res.status(500).send('<h1>Internal Server Error</h1>');
                    } else {
                        req.session.targetFollow = + targetId;
                        res.render('limitedView.ejs', {
                            fname: user.properties['fname'],
                            lname: user.properties['lname'],
                            bday: user.properties['bday'],
                            numFollowers: counts[0]['numFollowers'],
                            numFollowing: counts[0]['numFollowing'],
                            message: req.flash('limitedViewMessage')
                        });
                    }
                });
            }
        });
    });

    // AFTER THIS POINT, CLIENT SHOULD BE AUTHORIZED
    app.use(function(req, res, next) {
        if (!req.isAuthenticated()) {
            req.flash('loginMessage', 'Please login first');
            res.redirect('/');
        } else {
            next();
        }
    });

    app.get('/profile', function(req, res) {
        req.session.targetFollow = null;
        // TODO: Manage async clearly w/Streamline.js
        User.getFollowers(req.user._id, function(err, followers) {
            if (err) {
                console.log('ERROR: Couldn\'t get followers');
                res.status(500).send("<h1>Internal Server Error</h1>");
            } else {
                User.getFollowing(req.user._id, function(err, following) {
                    if (err) {
                        console.log('ERROR: Couldn\'t get following');
                        res.status(500).send("<h1>Internal Server Error</h1>");
                    } else {
                        res.render('profile.ejs', {
                            user: req.user,
                            following: following,
                            followers: followers,
                            message: req.flash('profileMessage')
                        });
                    }
                });
            }
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/follow', function(req, res) {
        var target = parseInt(req.session.targetFollow);
        if (target == parseInt(req._id)) {
            req.flash('limitedViewMessage', 'You cannot follow yourself');
            res.redirect('/views/'+target);
        }
        console.log('follow target:', target);
        if (!target) {
            req.flash('profileMessage', 'Cannot follow');
            res.redirect('/profile');
        } else {
           User.addUserRelationship('FOLLOW', parseInt(req.user._id), target, function(err) {
                if (err) {
                    console.log('failed');
                    console.log(err);
                    req.flash('profileMessage', 'following failed');
                    
                } else {
                    req.flash('profileMessage', 'following success');
                }
                res.redirect('/profile');
            });
        }
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}