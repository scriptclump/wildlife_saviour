/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Incident = require('../models/Incidents');
var Incidents = require('mongoose').model('Incident');

exports.createIncident = function(req, res){

    var incidentBody = req.body;

        incidentBody.incidentID = generateIncId();
      //  incidentBody.reportedDate = generateDate('reported');
    Incidents.create(incidentBody, function(err, data) {
        if(err) {
            if(err.toString().indexOf('E11000') > -1) {
                err = new Error('Duplicate Incident');
            }
            res.status(400);
            return res.json({reason:err.toString()});
        }
       res.status(200);
        res.json(data);
    });
}

var generateIncId = function (){
    var date = new Date();
    var incId = "IM"+date.getFullYear().toString() + date.getDate().toString() + (date.getMonth()+1).toString() +  date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString();

    return incId;

}

exports.getIncidentById = function(incId, res){
    Incidents.find({incidentID : incId}, function(err, details) {

        if (err){
            console.log("error");

            return res.status(500).json("Internal Database error");
        };

        res.status(200).json(details[0]);
    });

}

exports.updateIncident = function(payLoad, res){

    Incidents.findOneAndUpdate({'incidentID' : payLoad.incidentID}, payLoad, {upsert:true}, function(err, doc){
        if (err) return res.status(500).json(err);
        console.log(doc);
         res.status(200).json(doc);
    });
}
