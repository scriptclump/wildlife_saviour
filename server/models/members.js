var mongoose = require('mongoose');

var Member = mongoose.Schema(
        {
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true
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
                type: String
            },
            aNum: {
                type: String
            },
            empID: {
                type: String,
                uppercase:true
            },
            location: {
                type: String,
                required: true
            },
            designation: {
                type: String
            },
            created: {
                type: Date,
                default: Date.now
            }
        }
);
var Member = mongoose.model('Member', Member);
module.exports = Member;