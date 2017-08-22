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
app.use(morgan('tiny'));

app.set('view engine', 'ejs'); /* temporary */
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
var routes = require('./app/routes/route.js');
var api_routes = require('./app/routes/api.js');
app.use('/', routes);
app.use('/api', api_routes);

app.use(function(req, res, next) {
    res.status(404);
    res.render('404.ejs', { url: req.url });
});

// MARK: SERVER
app.listen(port, function() {
    console.log('Listening on port ' + port);
});