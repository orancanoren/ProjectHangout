var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

var app = express();
// CONFIGURE

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs'); /* will use React.js later */
app.set('views', __dirname + '/views');

app.use(express.static('./public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash()); // for flash messages stored in session

// for passport.js
app.use(session({ 
    secret: "SuperSecretKey!" ,
    name: "ProjectHangoutCookie",
    resave: true,
    saveUninitialized: true
}));

// configure passport
app.use(passport.initialize());
app.use(passport.session());
//app.use(passport.authenticate('remember-me'));
require('./config/passport.js')(passport);



// APP ROUTES
var routes = require('./app/routes/route.js');
var api_routes = require('./app/routes/api.js');
app.use('/', routes);
app.use('/api', api_routes);
app.all('*', (req, res) => {
    console.log('404:', req.method, req.url);
    res.render('404.ejs', {
        url: req.url
    });
});

// SERVER
app.listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port'));
});