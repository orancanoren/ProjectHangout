// SET UP
var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

// CONFIGURE
var app = express();
var port = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//app.use(morgan('tiny'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

require('./config/passport.js')(passport);

// for passport
app.use(session({ 
    secret: "LordOfFlavorWorldIsOranCanOren" ,
    name: "graph cookie",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // for flash messages stored in session

// routes
require('./app/routes/route.js')(app, passport);
require('./app/models/user.js')(app, passport);

// MARK: SERVER
app.listen(port, function() {
    console.log('Listening on port ' + port);
});