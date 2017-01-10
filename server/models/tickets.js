var mongoose = require('mongoose');
var ObjectId= mongoose.Types.ObjectId;
var autoIncrement = require('mongoose-auto-increment');

var ticketsSchema = mongoose.Schema({
  ticketID: {type:Number, unique:true},
  reportedDate: {type:Number, unique:true},
  closedDate: {type:Date, default: null},
  title: {type: String},
  empEmail: {type:String},
  empName:{type:String},
  tat_time:{type:Number,default:null},
  issue_type:{type:String},
  issue_type_cat_1:{type:String,default:null},
  issue_type_cat_2:{type:String,default:null},
  issue_type_cat_3:{type:String,default:null},
  issue_type_cat_4:{type:String,default:null},
  status: {type:String,default:"New"},
  priority: {type:String,default:"Low"},
  description : {type : String},
  img_Path: {type:Array},
  master_st:{type:Number,default:0},
  expected_end_time: {type:Number,default:0},
  child_st:{type:Number,default:0},
  halt_at:{type:Number,default:0},
  total_mins_spent:{type:Number,default:0},
  assign_to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        default:new ObjectId()
    },
  approved_list:{
        type: Array,
        approved_by:{
        	type:mongoose.Schema.Types.ObjectId,
        	ref: 'Member',
        	default:new ObjectId()
        }
  },
  approved_at:{type:Date, default: Date.now},
  approved_status:{type:String, default: null},    
  
  activityLogs:{type:Array},
  track_button:{type:Boolean ,default:false},
  ownerid: {
      type: mongoose.Schema.Types.ObjectId,
       ref: 'Member'
    },
  ownershipDate: {type:Date, default: null}, 
  approvalStatus:{type:String},
  changed_status_time :{type:Number ,default:0},
});

ticketsSchema.plugin(autoIncrement.plugin, { model: 'ticket', field: 'ticketID',startAt: 10000,incrementBy: 1 });
var ticketsModel = mongoose.model('ticket', ticketsSchema);
module.exports = ticketsModel;