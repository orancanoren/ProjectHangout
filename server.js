var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var cookieParser = require('cookie-parser');

var app = express();
// CONFIGURE

app.set('port', process.env.PORT || 3000);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// for passport.js
app.use(session({ 
    secret: "SuperSecretKey!" ,
    name: "PROJECT_HANGOUT",
    resave: true,
    saveUninitialized: true
}));

// configure passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport.js')(passport);


// APP ROUTES
app.use('/', require('./app/routes/api.js'));

// SERVER
app.listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port'));
});