
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    ticketID: {type : String},
    reportedBy: {type : String},
    reportedByEmail: {type : String},
    comment : {type : String},
    comment_type : {type : String},
    commentedByID: { // IT user
        type: Schema.Types.ObjectId,
        ref: 'MemberProfile'
    },
    commentedByName : {type : String},
    created: {
        type: Date,
        default: Date.now
    }
});
var comment = mongoose.model('comment', commentSchema);
module.exports = comment;