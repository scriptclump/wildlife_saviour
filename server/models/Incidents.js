var mongoose = require('mongoose');

var incidentSchema = mongoose.Schema(
        {
            email: {
                type: String,
                required: true,
                unique: true
            },
            fName: {
                type: String,
                required: true,
                expose: false
            },
            lName: {
                type: String,
                required: true
            },
            mNum: {
                type: String,
                required: true
            },
            aNum: {
                type: String,
                required: true
            },
            empID: {
                type: String,
                required: true
            },
            location: {
                type: String,
                required: true
            },
            designation: {
                type: String,
                required: true
            },
            created: {
                type: Date,
                default: Date.now
            }
        }
);
var Incident = mongoose.model('Incident', incidentSchema);
module.exports = Incident;