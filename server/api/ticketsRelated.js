var express = require('express');
var router = express.Router({strict: true});
var passport = require('passport');


var ticketsController = require('../controllers/ticketsRelated');

router.use(function (req, res, next) {
    next();
});
//passport.authenticate('jwt', {session: false}),
router.post('/new-ticket', function (req, res) {
    console.log('New Ticket from Router');
    ticketsController.createTicketWithAttachment(req, res);
});

router.post('/mytickets', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Inside My Tickets Router');
    ticketsController.getMyTickets(req, res);
});

router.get('/ticket', passport.authenticate('jwt', {session: false}), function (req, res) {
    //console.log('Hi i received cal');
    ticketsController.getTicket(req, res);
});
router.get('/filterTicketData', passport.authenticate('jwt', {session: false}), function (req, res) {
   console.log('2nd call: In the route');
   ticketsController.filterTicketData(req, res);
});

router.get('/ticketCount', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Hi i received cal');
    ticketsController.getTicketCount(req, res);
});

router.get('/ticket-detail', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('ticket detail trigger');
    //console.log(req.query);
    ticketsController.getTicketById(req, res);
});

router.post('/ticket-details-update', passport.authenticate('jwt', {session: false}), function (req, res) {
    //console.log('request received', req.body, req.params);
    ticketsController.ticketAttributeUpdateByTeam(req, res);
});

router.post('/ticket-time-tracker', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('req body at ticket-time-tracker',req.body);
    req.body.service_type == 1 ? ticketsController.ticketHrsTrackerON(req, res) : ticketsController.ticketHrsTrackerOFF(req, res);
});

//comment route
router.post('/add-comment', passport.authenticate('jwt', {session: false}), function (req, res) {
    // console.log('comment detail post trigger',req.body);

    ticketsController.commentAddedByTeam(req, res);
});

//comment route
router.post('/add-comment-emp', passport.authenticate('jwt', {session: false}), function (req, res) {
    // console.log('comment detail post trigger',req.body);
    ticketsController.commentAddedByTeamToEmp(req, res);
});

router.get('/comment', passport.authenticate('jwt', {session: false}), function (req, res) {

    ticketsController.getComments(req.query.tid, res);
});

router.post('/ticket-Ownership', passport.authenticate('jwt', {session: false}), function (req, res) {
    //console.log('ticket detail trigger....');
    ticketsController.ticketOwnerUpdate(req, res);
});

router.get('/membertickets', passport.authenticate('jwt', {session: false}), function (req, res) {
    //console.log('ticket detail trigger....');
    //console.log('/membertickets',req.query);
    ticketsController.getMemberTickets(req, res);
});
router.post('/ticketApprove', passport.authenticate('jwt', {session: false}), function (req, res) {
    //console.log('ticket detail trigger....');
    //approveTicket
    ticketsController.approveTicket(req, res);
});

router.get('/sendEmail-approval', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Inside sendEamil-approval');
    //console.log(req.query);
    ticketsController.sendEmailToApprover(req, res);
});
router.post('/activityLogs-approval', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Inside activityLogs-approval-approval');
    //console.log(req.query);
    ticketsController.activityLogsapproval(req, res);
});

router.get('/approvertickets', passport.authenticate('jwt', {session: false}), function (req, res) {
    ticketsController.getApproverTickets(req, res);
});
router.post('/add-comment-approver', passport.authenticate('jwt', {session: false}), function (req, res) {
    // console.log('comment detail post trigger',req.body);

    ticketsController.commentAddedByApprover(req, res);
});
router.get('/approvers', passport.authenticate('jwt', {session: false}), function (req, res) {   
    ticketsController.getApproverList(req, res);
});
router.get('/itteammemberslist',passport.authenticate('jwt', {session: false}), function (req, res) {
	ticketsController.getItTeamMembersList(req,res);
});

router.get('/approvers', passport.authenticate('jwt', {session: false}), function (req, res) {   
    ticketsController.getApproverList(req, res);
});
router.get('/itteammemberslist',passport.authenticate('jwt', {session: false}), function (req, res) {
	ticketsController.getItTeamMembersList(req,res);
});
/*Commented Approval Status code */
/*router.post('/ticket-approval-status', passport.authenticate('jwt', {session: false}), function (req, res) {
	//console.log(req.query);  
	ticketsController.ticketApprovalStatus(req, res);      
});*/


var multer = require('multer');

var storage = multer.diskStorage({//multers disk storage settings
    destination: function (req, file, cb) {
        //console.log(file);
        //aws_s3(file, '1476450831364');
        cb(null, './public/attachments/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        //console.log(file);
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});
var upload = multer({//multer settings
    storage: storage
}).any();
//}).single('file');

var aws_s3 = require('../controllers/aws-s3');

var fs = require('fs');
// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}




router.post('/upload', function (req, res) {
    console.log('Upload triggered req', req);
//    console.log('Upload triggered', req.query['file-type']);
//    console.log('Upload triggered', req.query['file-name']);
    //console.log(req.file.path);
    var attachment={};
    // console.log(req.file);
    // console.log(req.body.params);
    // console.log(req.params);
    // console.log(req.data);
    // console.log(req.files);
    upload(req, res, function (err) {
        console.log(req.body.params);
        if (err) {
            console.log(err);
            res.json({error_code: 1, err_desc: err});
            return;
        } else {
            console.log(req.files);
            console.log(req.file);
            //var bufferedData=base64_encode(req.file.path);
            // var bitmap = fs.readFileSync(req.file.path);
            // attachment.content=new Buffer(bitmap);
            // attachment.fileName=req.file.filename;
            // attachment.length=req.file.size;
            // console.log(attachment);
            // //aws_s3(attachment,'123132434');
            // console.log('res files',req.file);
            // console.log('res files',res.file);
            // console.log('No error occured while uploading image');

        }
        res.json({error_code: 0, err_desc: null});
    });
});



module.exports = router;

//router.post('/ticket-field-update', function (req, res) {
//
//    ticketsController.ticketFieldUpdate(req.body, res);
//});

//var mailistenerController = require('../controllers/maillistener.js');
//var ControllerConstruct = new mailistenerController({});