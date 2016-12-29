var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var cors         = require('cors');
var passport     = require('passport');
var jwt          = require('jwt-simple');

// view engine setup
module.exports = function (app, config) {
    app.set('views', path.join(config.rootPath, 'public'));
    app.set('view engine', 'ejs');
    app.use(logger('dev'));
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cors());
    app.use(cookieParser());
    app.use(express.static(path.join(config.rootPath, 'public')));
    //initialize passport
    app.use(passport.initialize());
}