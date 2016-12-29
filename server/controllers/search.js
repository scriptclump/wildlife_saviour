

var Ticket = require('../models/tickets');
var Tickets = require('mongoose').model('ticket');

function toTimestamp(strDate){
   var datum = Date.parse(strDate);
   return datum;
}

exports.searchByDateRange = function(req, res){
    var fromDate = req.body.fromDate;
    fromDate = toTimestamp(fromDate+" 00:00:00");
    var toDate = req.body.toDate;
    toDate = toTimestamp(toDate+" 23:59:59");
    Tickets.find().where('reportedDate').gte(fromDate).lte(toDate).populate('assign_to', '_id fName lName').exec(function (err, data) {
		if (err){
			console.log('Search Error :: ' + err);
			return res.status(500).json("Internal Server Error");
		}else{
			res.status(200).json(data);
		}
	});
}

exports.searchByApplication = function(req, res){

    var application = req.body.application;
    Tickets.find()
        .where('application').equals(application)
        .sort({ reportedDate : '-1'})
        .exec(function(err, docs){
            if(err) return res.status(500).json("Internal Server Error");
            res.status(200).json(docs);
        }
    );
}
