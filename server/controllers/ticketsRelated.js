/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var config = require('../config/config');
var htmlToText = require('html-to-text');
var attachmentPath = config.attachmentsPath;
var applicationUrl = config.applicationUrl;

var ticketModel_parent = require('../models/tickets');
var ticketModel = require('mongoose').model('ticket');

var commentModel = require('../models/comment');
var commentModels = require('mongoose').model('comment');

var role = require('../models/roles');
var roles = require('mongoose').model('Roles');

var userAuthority = require('../models/user-authority');
var Authority = require('mongoose').model('Authority');

var Member = require('../models/members');
var Members = require('mongoose').model('Member');

var mailer = require('./mailer.js');
var request = require('request');

var App = require('./app.js');

var aws_s3 = require('./aws-s3');
var fs = require('fs');

var multer = require('multer');

var storage = multer.diskStorage({//multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/attachments/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, "file_"+datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});
var upload = multer({//multer settings
    storage: storage
}).any();

var getTimeSpent = function (startTime, endTime) {
    var seconds = Math.floor((endTime - (startTime)) / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    hours = hours - (days * 24);
    minutes = minutes - (days * 24 * 60);
    return minutes;
};


exports.getTicketCount = function (req, res) {
    var params = {};
    if (req.query) {
        params = req.query;
    }

    if (req.query.status === 'unclosed') {
        console.log('unclosed link clicked');
        params = {
            'status': {$ne: 'Close'}
        };
    }

    ticketModel.count(params, function (err, count) {
        if (err) {
            console.log('inside error');
            return res.status(500).json(count);
        }
        if (count) {
            return res.status(200).json(count);
        }
    });
}
exports.getTicket = function (req, res) {
    var params = {};
    if (req.query && !req.query.tat_tickets) {
        if (req.query) {
            params = req.query;
        }
    } else {
        var curr_time = Date.now();
        params = {
            'expected_end_time': {$lt: curr_time},
            'status': {$ne: 'Close'}
        };
    }
    if (req.query.status === 'UnClosed') {
        params = {
            'status': {$ne: 'Close'}
        };
    }
    ticketModel.find(params, function (err, details) {
        if (err) {
            console.log("error");
            return res.status(500).json("Internal Database error");
        }
        
        return res.status(200).json(details);
    }).sort({_id: -1}).populate('assign_to', '_id fName lName').exec(function (err, story) {
        if (err)
          
            return res.status(500).send(err);
    });
};

exports.getTicketById = function (req, res) {
    
    ticketModel.find({ticketID: req.query.ticketID}, function (err, found) {
        if (err) {
            res.status(500).json("Internal Database error");
            //res.send(err);
        } else {
            if (found.length <= 0) {
                res.send("Invalid Ticket Number!");
            } else {
                res.send(found);
            }
            ;
        }
        ;
    }).populate('assign_to ownerid').exec(function (err, story) {
        if (err)
           
            return res.send(err);
    });
};

var turnONTracker = function (params, callback) {
    console.log('turnONTracker', params);
    ticketModel.find({ticketID: params.ticketID}, function (err, update) {
        if (err) {
            console.log('Error occured while fetching ticket details', err);
            callback({sucess: false, msg: err});
            } else {
            if (update.length <= 0) {
                callback({sucess: false, msg: 'Invalid Ticket Number!'});
            } else {
                var trackLogLength = update.time_track_log;
                
                if (params.service_type == 1) {
                    var button_stat = true;
                }
                update[0].master_st == 0 ? ticketModel.findByIdAndUpdate({_id: update[0]._id},
                        {
                            $set: {
                                master_st: Date.now(),
                                track_button: button_stat
                            }
                        }, function (err, updated) {
                    if (err) {
                        callback({sucess: false, msg: err});
                       } else {
                        
                        callback({sucess: true, msg: updated});
                    };
                }) : ticketModel.findByIdAndUpdate({_id: update[0]._id},
                        {
                            $set: {
                                child_st: Date.now(),
                                track_button: button_stat
                            }
                        }, function (err, updated) {
                    if (err) {
                       callback({sucess: false, msg: err});
                    } else {
                        callback({sucess: true, msg: "Updated Record !"});
                    }
                    ;
                });
            };
        }
        ;
    });
}

exports.ticketHrsTrackerON = function (req, res) {
    var params = {
        ticketID: req.body.ticketID,
        service_type: req.body.service_type
    };
    console.log('ticketHrsTrackerON Turn ON OFF tracker based on its values', params);
    turnONTracker(params, function (result) {
        if (result.sucess === false) {
            console.log('error occured while turning on tracker',result.msg);
            return res.status(500).send(result.msg);
        } else {
            console.log('ticket Timer Turned ON',result);
            return res.status(200).send(result.msg);
        }
    });
};
exports.ticketHrsTrackerOFF = function (req, res) {
    console.log('came into off function', req.body);
    ticketModel.find({ticketID: req.body.ticketID}, function (err, update) {
        if (err) {
            console.log('Error occured while switching database',err);
            return res.status(500).json("Internal Database error").end();
            
        } else {

            if (update.length <= 0) {
                return res.send("Invalid Ticket Number!");
            } else {
                
                var startTime = (update[0].child_st == 0 ? update[0].master_st : update[0].child_st);
                var ext_hrs = update[0].total_mins_spent;
                var button_stat = update[0].track_button;
                
                ticketModel.findByIdAndUpdate({_id: update[0]._id},
                        {
                            $set: {
                                halt_at: Date.now(),
                                total_mins_spent: (ext_hrs + getTimeSpent(startTime, Date.now())),
                                track_button: !button_stat
                            }
                        }, function (err, updated) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json("Updated Record!!").end();
                        
                    };
                });
            };
        }
        ;
    });
};


exports.createTicket = function (data, callback) {
    console.log('Inside Create Ticket Server');
    var email = data.email === undefined ? data.body.email : data.email;
    var name = data.name === undefined ? data.body.name : data.name;
    var subject = data.subject === undefined ? data.body.subject : data.subject;
    var desc = data.description === undefined ? data.body.description : data.description;
    var ticketID = data.ticketID === undefined ? data.body.ticketID : data.ticketID;

    var StartedAt = Date.now();
    var startDateFormated = new Date(StartedAt);
    var expected_end_time = startDateFormated.setHours(startDateFormated.getHours() + 1);

    
    var mailListnerBody = {
        reportedBy_Mail: email,
        reportedBy_Name: name,
        title: subject,
        description: desc,
        ticketID: ticketID
    };
    
    ticketModel.create({
        reportedDate: mailListnerBody.ticketID,
        title: mailListnerBody.title,
        empEmail: mailListnerBody.reportedBy_Mail,
        empName: mailListnerBody.reportedBy_Name,
        description: mailListnerBody.description,
        master_st: StartedAt,// set the ticket timer time
        expected_end_time: expected_end_time,
        track_button: true, // mark the button on
        tat_time: 1
    }, function (err, create) {
        if (err) {
            console.log(err);
            return callback({sucess: false, msg: 'Ticket has not been regestered'});
        } else {
            console.log('create success with ID ', create.ticketID);
            var title = '#' + create.ticketID + ' ' + create.title;
            var params = {
                applicationUrl: applicationUrl,
                name:create.empName,
                TicketID: create.ticketID
            };
           
            mailer.mailerService(create.empEmail, title, params, 'template-newticket');
            App.socketNotification(create);
            return callback({sucess: true, msg: 'Ticket has been registered successfully'});
        }
    });  /// Create Record Operation Ends here
};

exports.createTicketWithAttachment = function (req, res) {
   
    var StartedAt = Date.now();
    var startDateFormated = new Date(StartedAt);
    var expected_end_time = startDateFormated.setHours(startDateFormated.getHours() + 1);
    upload(req, res, function (err) {
        console.log(req.body.params);
       
        if (err) {
            console.log(err);
            res.json({error_code: 1, err_desc: err});
            return;
        } else {

            ticketModel.create({
                reportedDate: req.body.params.ticketID,
                title: req.body.params.subject,
                empEmail: req.body.params.email,
                empName: req.body.params.name,
                description: req.body.params.desc,
                master_st: StartedAt, // set the ticket timer time
                expected_end_time: expected_end_time,
                track_button: true, // mark the button on
                tat_time: 1
            }, function (err, create) {
                if (err) {
                    console.log(err);
                    return res.json({error_code: 1, err_desc: err});
                } else {
                    var FilesUploaded = req.files;
                    FilesUploaded.forEach(function (currentVal, index, array) {
                        var attachment = {};
                        var bitmap = fs.readFileSync(currentVal.path);
                        attachment.content = new Buffer(bitmap);
                        attachment.fileName = currentVal.filename;                     
                        attachment.length = currentVal.size;
                       
                        var attachment_url = attachmentPath+attachment.fileName;                       
                        ticketModel.findOneAndUpdate({ticketID: create.ticketID}, {$push: {img_Path: attachment_url}},
                                function (err, suc) {
                                    if (err) {
                                        console.log('Updateion Failed');
                                    } else {
                                        console.log('Updation successfull');
                                    };
                                });
                        
                       // aws_s3(attachment,create.ticketID);
                    })

                    /*****Uncomment these lines when not Oplogs listener is turned off*****/
                    //   console.log('create success with ID', create.ticketID);
             //      var title = '#' + create.ticketID + ' ' + create.title;
             //      var params = {
              //      applicationUrl: applicationUrl,
              //         TicketID: create.ticketID,
              //          name:create.empName
              //     };
              //      mailer.mailerService(create.empEmail, title, params, 'template-newticket');
                    //App.socketNotification(create);
                    /*****************************************************/
                    return res.json({error_code: 0, err_desc: 'success'});
                }
            }); /// Create Record Operation Ends here

        }

    });
};

exports.ticketAttributeUpdateByTeam = function (req, res) {
   
    var value = {};
    value[req.body.parameter] = req.body.toVal;
    value.changed_status_time =req.body.changed_status_time;
    if (req.body.parameter === 'tat_time') {
        
        var StartedAt = req.body.master_st;
        var startDateFormated = new Date(StartedAt);
        var expected_end_time = startDateFormated.setHours(startDateFormated.getHours() + parseInt(req.body.toVal));
        value.expected_end_time = expected_end_time;
    }

    if (req.body.parameter === 'status' && req.body.toVal == 'Close') {
        var closedDate = new Date();
        value.closedDate = closedDate;
    }
    
    ticketModel.findOneAndUpdate({ticketID: req.body.ticketID},
            {
                $set: value,
                $push: {'activityLogs': req.body.activityLog}
            }, function (err, updated) {
        if (err) {
            console.log(err, 'error occured');
            res.status(500).send(err);
        } else {
            res.status(200).send('Success Updated value');
           
        }
    });
};

exports.commentAddedByTeam = function (req, res) {
   

    var commentBody = req.body;
   
     console.log('comment detail - ticketID:',commentBody.ticketID);
    
    var newCommentModel = new commentModel({
        ticketID: commentBody.ticketID,
        tid: commentBody.tid,
        reportedBy: commentBody.reportedby,
        reportedByEmail: commentBody.reportedbyemail,
        comment: commentBody.comment,
        commentedByID: commentBody.userid,
        commentedByName: commentBody.username,
        name:commentBody.name,
        comment_type: 'team_team'
    });
    
    newCommentModel.save(function (err, data) {
        
        if (err) {
            console.log('error occured while saving comment', err);
            res.status(400);
            return res.json({msg: 'comment is not able to save.'});
        } else {
            res.status(200);
            return res.json(data);
        }

    });
};

exports.commentAddedByApprover = function (req, res) {
    var commentBody = req.body;
    var newCommentModel = new commentModel({
        ticketID: commentBody.ticketID,
        tid: commentBody.tid,
        reportedBy: commentBody.reportedby,
        reportedByEmail: commentBody.reportedbyemail,
        comment: commentBody.comment,
        commentedByID: commentBody.userid,
        commentedByName: commentBody.username,
        comment_type: 'team_approver'
    });
    newCommentModel.save(function (err, data) {
       
        if (err) {
            console.log('error occured while saving comment', err);
            res.status(400);
            return res.json({msg: 'comment is not able to save.'});
        } else {
            res.status(200);
            return res.json(data);
        }

    });
};



exports.addCommentByEmployee = function (params) {
    
    if (params.ticketType === 'approver', params) {
        console.log("inside params.ticketType");
        var comment_type = 'team_approver';
    } else {
        var comment_type = 'team_emp';
    }

    var newCommentModel = new commentModel({
        ticketID: params.ticketID,
        reportedBy: params.emp_name,
        reportedByEmail: params.emp_email,
        comment: params.comment,
        commentedByName: params.emp_name,
        comment_type: comment_type
    });

    newCommentModel.save(function (err, data) {
       
        if (err) {
            console.log('error occured while saving comment', err);
            
        } else {
            console.log('New Mail received and saved as a comment to existing ticket');
        }

    });
};
exports.commentAddedByTeamToEmp = function (req, res) {
    var commentBody = req.body;
    console.log(commentBody);
    var newCommentModel = new commentModel({
        ticketID: commentBody.ticketID,
        tid: commentBody.tid,
        reportedBy: commentBody.reportedby,
        reportedByEmail: commentBody.reportedbyemail,
        comment: commentBody.comment,
        commentedByID: commentBody.userid,
        commentedByName: commentBody.username,
        name:commentBody.name,
        comment_type: 'team_emp'
    });
    newCommentModel.save(function (err, data) {
        
        if (err) {
            res.status(400);
            return res.json({msg: 'comment is not able to save.'});
        } else {
             
            if (commentBody.notifyEmp === true) {
                var subject = '#' + commentBody.ticketID + ' - comment is added by ' + commentBody.username;
                var params = {
                    comment: commentBody.comment,
                    commentedBy: commentBody.username,
                    name:commentBody.name,
                    ticketID: commentBody.ticketID
                };
                mailer.mailerService(commentBody.reportedbyemail, subject, params, 'template-comment');
            }
            

            res.status(200);
            res.json(data);
        }

    });
};
exports.getComments = function (tid, res) {
   
    commentModels.find({ticketID: tid}, function (err, comments) {
        if (err) {
            console.log("error", err);
            return res.status(500).json("Internal Database error");
        } else {
            res.status(200).send(comments);
        }
    });
};

exports.ticketOwnerUpdate = function (req, res) {
    var recID = req.body.recID;
    var ownerid = req.body.ownerid;
    var msg = req.body.msg;
    ticketModel.findByIdAndUpdate({_id: recID},
            {
                $set:
                        {
                            status: 'Open',
                            ownerid: ownerid,
                            ownershipDate: Date.now()
                        },
                $push: {'activityLogs': req.body.msg}
            },
            function (err, updated) {
                if (err) {
                    console.log("error", err);
                    
                } else {
                    res.status(200);
                    res.send({success: true, msg: 'Ownership has been updated.'});
                }
            });
};


exports.activityLogsapproval = function (req, res) {
    console.log('..............',req.body);
    var tid = req.body.tid;
    var msg = req.body.msg;
    var msg1 = req.body.msg1;
    ticketModel.findOneAndUpdate({ticketID: tid},
            {
             $push: {'activityLogs': {$each: [ req.body.msg1, req.body.msg ] }}
            },
            function (err, updated) {
                if (err) {
                    console.log("error", err);
                    
                } else {
                    
                    res.status(200);
                    res.send({success: true, msg: 'Ownership has been updated.'});
                }
            });
};

exports.getMemberTickets = function (req, res) {
    console.log(req.query);
    ticketModel.find({assign_to: req.query.memberID}, function (err, tickets) {
        if (err) {
            console.log("error", err);
            return res.status(500).json("Internal Database error");
        } else {
            console.log("Ownership updated... ", tickets);
            res.status(200);
            res.send({success: true, data: tickets});
        }
    });
};


exports.getMyTickets = function (req, res) {
    console.log(req.body);
    var ticketdata = req.body;
    var email = ticketdata.email === undefined ? ticketdata.body.email : ticketdata.email;
    console.log("email :: ", email);
    ticketModel.find({empEmail: email}).populate('assign_to', '_id fName lName').exec(function (err, tickets) {
        if (err) {
            console.log("error", err);
            return res.status(500).json("Internal Database error");
        } else {
            res.status(200);
            res.send({success: true, data: tickets});
        }
    });
    
};

exports.getApproverTickets = function (req, res) {
    console.log("inside log", req.query.memberID);


    ticketModel.find({approved_list: {'$in': [req.query.memberID]}}, function (err, data) {
        if (err) {
            console.log("error", err);
            return res.status(500).json("Internal Database error");
        } else {
            console.log("Ownership updated... ", data);


            res.status(200);
            res.send({success: true, data: data});
        }
    });
};

exports.approveTicket = function (req, res) {
    console.log(req.body);
    var ticketID = req.body.ticketID;
    ticketModel.findByIdAndUpdate({ticketID: ticketID},
            {
                $set:
                        {
                            status: 'Open',
                            ownerid: ownerid,
                            ownershipDate: Date.now()
                        },
                $push: {'activityLogs': req.body.msg}
            },
            function (err, updated) {
                if (err) {
                    console.log("error", err);
                } else {
                    res.status(200);
                    res.send({success: true, data: updated});
                }
            });
};

exports.getApproverList = function (req, res) {
    var approverlist = [];
    var counter = 0;
    roles.find({}, function (err, userRoles) {
        if (err) {
            console.log("error");
        } else {
            if (userRoles) {
                userRoles.forEach(function (role, index, array) {
                    if (role.name === "Role_Approver") {
                        Authority.find({role_id: role._id}, function (err, userAuthoritys) {
                            if (err) {
                                console.log("error");
                            } else {
                                userAuthoritys.forEach(function (userauthority, index, array) {
                                    Members.find({email: userauthority.email}, function (err, details) {
                                        if (err) {
                                            console.log("error");
                                        } else {
                                            counter++;
                                            approverlist.push(details[0]);
                                            if (counter == userAuthoritys.length) {
                                                res.send(approverlist);
                                            }
                                        }
                                    });
                                });
                            }
                            ;
                        });
                    }
                    ;
                });
            }
            ;
        }
    });
};
exports.sendEmailToApprover = function (req, res) {
    
    ticketModel.findOneAndUpdate({ticketID: req.query.tid},
            {
                $set: {status: 'Pending for Approval'},
                $push: {'approved_list': req.query.approver}
            }, function (err, updated) { 
        if (err) {
            console.log(err, 'error occured at updating');
            res.status(500).send(err);
        } else {
            Members.find({_id: req.query.approver}, function (err, details) {
                if (err) {
                    console.log("error");
                } else {
                	var approverName = details[0].fName + " " + details[0].lName;
                	console.log("approverlist--------",approverName);
                     var description = htmlToText.fromString(req.query.description, {
                         wordwrap: 80,
                         table: [], 
                         hideLinkHrefIfSameAsText :true ,
                         linkHrefBaseUrl :false ,
                         preserveNewlines : false ,
                         uppercaseHeadings :false ,
                         returnDomByDefault :true,
                         ignoreHref  : true,
                         ignoreImage : false,
                     });
                    var params = {
                       
                        ticketOwner: req.query.ticketOwner,
                        link: req.query.link,
                        description: description,
                        empName: req.query.empName,
                        approverName: approverName,
                        ticketID: req.query.tid
                    };
                      mailer.mailerService(details[0].email, req.query.subject, params, 'template-approverComment');     

                    res.status(200).send("success");
                }
            });
        }
    });
};

exports.getItTeamMembersList = function (req, res) {
    var memberlist = [];
    var counter = 0;
    roles.find({}, function (err, userRoles) {
        if (err) {
            console.log("error");
        } else {
            if (userRoles) {
                userRoles.forEach(function (role, index, array) {
                    if (role.name === "Role_ITTeamMember") {
                        Authority.find({role_id: role._id}, function (err, userAuthoritys) {
                            if (err) {
                                console.log("error");
                            } else {
                                userAuthoritys.forEach(function (userauthority, index, array) {
                                    Members.find({email: userauthority.email}, function (err, details) {
                                        if (err) {
                                            console.log("error");
                                        } else {
                                            counter++;
                                            memberlist.push(details[0]);
                                            if (counter == userAuthoritys.length) {
                                                res.status(200).send(memberlist);
                                            }
                                        }
                                    });
                                });
                            }
                            ;
                        });
                    }
                    ;
                });
            }else{
               res.status(500).send('No users Found'); 
            }
            ;
        }
    });
};

/* commented Approval Status Code*/

 exports.ticketApprovalStatus = function (req, res) {
 ticketModel.findOneAndUpdate({ticketID: req.body.ticketID},
 {
 $set: {
 approvalStatus: req.body.approvalStatus
 }
 }, function (err, updated) {
 if (err) {
 console.log(err, 'error occured');
 res.status(500).send(err);
 } else {
 res.send(updated);
 var params = {
 link: req.body.link,
 ticketID: req.body.ticketID,
 status:updated.approvalStatus
 };
 mailer.mailerService(req.body.ticketOwnerEmail, "", params, 'template-approverNotification');
 }
 });
 };
