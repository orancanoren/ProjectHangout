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
        var targetId = parseInt(req.params.id);
        User.getByCredId(targetId, function(err, user) {
            if (err == "user not found") {
                if (! req.isAuthenticated()) {
                    req.flash('loginMessage', 'User doesn\'t exist');
                    res.redirect('/');
                } else {
                    req.flash('profileMessage', 'User doesn\'t exist');
                    res.redirect('/profile');
                }
            }
            else if (err) {
                console.log(err);
                res.status(500).send("<h1>Internal Server Error</h1>");
            } else {
                User.getFollowCounts(targetId, function(err, counts) {
                    if (err) {
                        console.log(err);
                        res.status(500).send('<h1>Internal Server Error</h1>');
                    } else {
                        res.render('limitedView.ejs', {
                            fname: user.properties['fname'],
                            lname: user.properties['lname'],
                            bday: user.properties['bday'],
                            sex: user.properties['sex'],
                            numFollowers: counts[0]['numFollowers'],
                            numFollowing: counts[0]['numFollowing'],
                            message: req.flash('limitedViewMessage'),
                            id: targetId
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
                            id: req.user._id,
                            fname: req.user.properties.fname,
                            lname: req.user.properties.lname,
                            bday: req.user.properties.bday,
                            sex: req.user.properties.sex,
                            email: req.user.properties.email,
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

    app.get('/follow/:id', function(req, res) {
        var target = parseInt(req.params.id);
        var selfId = parseInt(req.user._id);
        console.log(selfId + ' wants to follow ' + target);
        if (target == selfId) {
            console.log('same');
            req.flash('limitedViewMessage', 'You cannot follow yourself');
            res.redirect('/view/'+target);
        } else if (target == null) {
            req.flash('profileMessage', 'Cannot follow');
            res.redirect('/profile');
        } else {
           User.addUserRelationship('FOLLOW', selfId, target, function(err, rel) {
                if (err) {
                    console.log(err);
                    req.flash('profileMessage', 'following failed');
                    res.redirect('/profile');
                } else {
                    console.log(rel);
                    req.flash('profileMessage', 'following success');
                    res.redirect('/profile');
                }
                
            });
        }
    });

    app.use(function(req, res, next) {
        res.status(404);

        if (req.accepts('html')) {
            res.render('404.ejs', { url: req.url });
            return;
        }

        if (req.accepts('json')) {
            res.send({ error: 'Not found',
                        url: req.url});
            return;
        }

        res.type('txt').send('Not found');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}