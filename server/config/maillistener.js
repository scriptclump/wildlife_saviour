// Maillistner 
var MailListener = require("../controllers/maillistener");
var ticketsController = require("../controllers/ticketsRelated");
var aws_s3 = require('../controllers/aws-s3');
var domainNamesAllowed=require("./config")['mailDomainsAllowed'];
var sanitizeHtml = require('sanitize-html');


function checkDomainExist(email) {
    var isAllowed=false;
    email=email.toLowerCase();
    var domain = email.replace(/.*@/, ""); // getting domain foloowed by .com, .org, .co.in
    var domainNamefetch = domain.split("."); // extracting exact domain name
    var domainName = domainNamefetch[0];   // assigning domain name to variable
    if(domainNamesAllowed.indexOf(domainName)!==-1){
        isAllowed=true;
    }else{
        isAllowed=false;
    }
    return isAllowed;
}




module.exports = function (mailConfig) {    
    var mailListener = new MailListener(mailConfig);
    mailListener.start();
    mailListener.on("server:connected", function () { 
        console.log("imapConnected");
    });

    mailListener.on("server:disconnected", function () {
        console.log("imapDisconnected");
        console.log('Error Occured now tring to restart',ImapErrorOccured);
    });

    mailListener.on("error", function (err) {
        
        console.log(err);
    });

    var tID = null;
    var generateTicketID = function () {
        return Date.now();
    };
    mailListener.on("attachment", function (attachment) {
        if (!tID) {
            tID = generateTicketID();
            console.log('Attachment Ticket-ID NOT exist', tID);
        } else {
            console.log('Attachement Ticket-ID Exist', tID);
        }
        aws_s3(attachment, tID);
    });
    mailListener.on("mail", function (mail) {
        var emp_email = mail.from[0].address;
        if(emp_email&&checkDomainExist(emp_email)===false){
            console.log('domain Not allowed received a mail from: ',emp_email);
            return false;
        }
        var emp_name = mail.from[0].name;
        var subject = mail.subject;
        var description = mail.html;
       var cleanedHTMLTags = sanitizeHtml(description);
       var ticketType='';
        if (subject) {
        	if(subject.match(/#[0-9]*/)){
        		 var n = subject.match(/#[0-9]*/);
        		 ticketType='employee';
        	}else if(subject.match(/#[0-9]*_[a-z]*/)){
        		console.log("inside mail listenr Approver");
        		var n = subject.substring(0, subject.lastIndexOf('_') + 1);
        		ticketType='approver';
        	}
           
        }
        if (n && n[0]) {
            var ticketID = n[0].replace('#', '');
            var params = {
                ticketID: ticketID,
                emp_email: emp_email,
                emp_name: emp_name,
                subject: subject,
                comment: cleanedHTMLTags,
                ticketType:ticketType
            };
            if (tID) {
                //Attachments exist for comment reply mail
                params.attachTicketID = tID;
            }
            /*********************************************************
             *If Ticket Already exists add as a comment to the ticket
             *********************************************************/
            ticketsController.addCommentByEmployee(params);
            
            //ticketsController.addCommentByApprover(params);
            
            tID = null;
        } else {
            if (!tID) {
                tID = generateTicketID();
                console.log('Mail Ticket-ID NOT exist', tID);
            }
            var params = {
                    ticketID: tID,
                    email: emp_email,
                    name: emp_name,
                    subject: subject,
                    description: cleanedHTMLTags
                };
            //ticketsController.createTicket(tID, emp_email, emp_name, subject, cleanedHTMLTags);
            ticketsController.createTicket(params);
            tID = null;
        }

    });
};
