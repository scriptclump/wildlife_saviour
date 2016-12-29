var MongoOplog = require('mongo-oplog');
var mailer = require('./mailer.js');
var App = require('./app.js');
var config = require('../config/config');
var applicationUrl = config.applicationUrl;

module.exports = function (config) {

	var oplog = MongoOplog(config.db, { ns: 'IT-help-desk.tickets' });

	oplog.on('op', function (data) {
	});

	oplog.on('insert', function (doc) {
	  console.log('New Doc inserted',doc);
	  var title = '#' + doc.o.ticketID + ' ' + doc.o.title;
	  var ticketLink = applicationUrl+"/dashboard/tickets/ticket-detail/"+doc.o.ticketID;
            var params = {
            	name: doc.o.empName,
                TicketID: doc.o.ticketID,
                TicketLink: ticketLink
            };
	  mailer.mailerService(doc.o.empEmail, title, params, 'template-newticket');
          App.socketNotification(doc.o);
	});

	// oplog.on('update', function (doc) {
	//   //console.log(doc);
	// });

	// oplog.on('delete', function (doc) {
	//   //console.log(doc.o._id);
	// });

	oplog.on('error', function (error) {
	  console.log(error);
	});

	oplog.on('end', function () {
	  console.log('Stream ended');
	});

	oplog.stop(function () {
	  console.log('server stopped');
	});
	oplog.tail(function(){
	  console.log('tailing started');
	})

}