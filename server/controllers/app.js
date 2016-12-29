var express = require('express');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//console.log('Environment variables', env);

var app = express();

var config = require('../config/config')[env];

var mailConfig = require('../config/config')['mailListener'];

var passport = require('passport');

var busboy = require('connect-busboy');

var methodOverride = require('method-override');

require('../config/express')(app, config);

require('../config/mongoose')(config);

require('../config/api')(app);

require('../config/routes')(app);

require('../config/passport')(passport);

//app.use(passport.initialize());
//require('../config/maillistener')(mailConfig);

// Initiate Listener File

require('../controllers/db_changes_listener')(config);


app.use(busboy());

//////// ###### Sockets ##### //////
var port = config.port || 9000;
console.log('Port set to', port);
var server = app.listen(port);
//var http = require('http').Server(app);
var io = require('socket.io').listen(server);
// io.on('connection', function (socket) {
//   socket.emit('ticket',data);
// });
exports.socketNotification = function (data) {
    //console.log('socketNotification is called');
    io.emit('ticket', data);
};