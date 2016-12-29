// var express = require('express');

// var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// var app = express();

// var config = require('./server/config/config')[env];

// var mailConfig = require('./server/config/config')['mailListener'];

// var passport = require('passport');

// var busboy = require('connect-busboy');

// var methodOverride= require('method-override');

// require('./server/config/express')(app, config);

// require('./server/config/mongoose')(config);

// require('./server/config/api')(app);

// require('./server/config/routes')(app);

// require('./server/config/passport')(passport);
// //app.use(passport.initialize());

// require('./server/config/maillistener')(mailConfig);

// app.use(busboy());

// //////// ###### Sockets ##### //////




// var server = app.listen(8080);
// //var http = require('http').Server(app);
// var io = require('socket.io').listen(server);
// // io.on('connection', function (socket) {
// //   socket.emit('ticket',data);
  
// // });
// exports.socketNotification= function(data){

// console.log('socketNotification is called');
//  io.emit('ticket',data);
// }