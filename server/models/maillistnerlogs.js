var mongoose = require('mongoose');

var mailListnerLogsSchema = mongoose.Schema(
        {
            error: {
                type: String,
                default: null
            },
            action:{type:String,default: null},
            created: {
                type: Date,
                default: Date.now
            }
        }
);
var maillistnerlogs = mongoose.model('maillistnerlogs', mailListnerLogsSchema);
module.exports = maillistnerlogs;