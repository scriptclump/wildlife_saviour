/**
 * Created by Pkp on 5/14/2016.
 */

var Incident = require('../models/Incidents');
var Incidents = require('mongoose').model('Incident');

exports.getLatestIncidents = function (res) {

    Incidents.find()
            .sort({reportedDate: '-1'})
            .where('incidentType').equals('Defect')
            .select('incidentID title application status')
            .limit(5)
            .where('status').nin(['Closed', 'Rejected'])
            .exec(function (err, docs) {
                if (err)
                    return res.status(500).json("Internal Server Error");
                res.status(200).json(docs);
            });
}

exports.getLatestChanges = function (res) {

    Incidents.find()
            .sort({reportedDate: '-1'})
            .where('incidentType').equals('Change Request')
            .select('incidentID title application status')
            .where('status').nin(['Closed', 'Rejected'])
            .limit(5)
            .exec(function (err, docs) {
                if (err)
                    return res.status(500).json("Internal Server Error");
                res.status(200).json(docs);
            }
            );
}

exports.getLatestRequests = function (res) {

    Incidents.find()
            .sort({reportedDate: '-1'})
            .where('incidentType').equals('Request for Information')
            .select('incidentID title application status')
            .where('status').nin(['Closed', 'Rejected'])
            .limit(5)
            .exec(function (err, docs) {
                if (err)
                    return res.status(500).json("Internal Server Error");
                res.status(200).json(docs);
            }
            );
}

exports.getMonthStats = function (res, incidentType) {

    var dateobj = new Date();
    var fromDate = new Date(dateobj.getFullYear(), dateobj.getMonth(), 1);
    var toDate = new Date(dateobj.getFullYear(), dateobj.getMonth(), 31);


    Incidents.find()
            .where('incidentType').equals(incidentType)
            .where('reportedDate').gte(fromDate).lte(toDate)
            .exec(function (err, docs) {
                if (err)
                    return res.status(500).json("Internal Server Error");
                res.status(200).json(docs);
            }
            );
}

