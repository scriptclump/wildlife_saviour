var nodemailer = require('nodemailer');
var mailerConfig=require('../config/config')['mailer'];
var userName = encodeURI(mailerConfig.username);
var userpwd = mailerConfig.password;
var smtp_server = mailerConfig.smtpHost;
var transporter = nodemailer.createTransport('smtp://' + userName + ':' + userpwd + '@' + smtp_server);
var EmailTemplates = require('swig-email-templates');
var templates = new EmailTemplates();
var mailDomainsAllowed = require('../config/config')['mailDomainsAllowed']


function checkDomainExist(email) {
    console.log('Email Received',email);
    var isAllowed=false;
    email=email.toLowerCase();
    var domain = email.replace(/.*@/, ""); // getting domain foloowed by .com, .org, .co.in
    var domainNamefetch = domain.split("."); // extracting exact domain name
    var domainName = domainNamefetch[0];   // assigning domain name to variable
    if(mailDomainsAllowed.indexOf(domainName)!==-1){
        isAllowed=true;
    }else{
        isAllowed=false;
    }
    return isAllowed;
}

exports.mailerService = function (empEmail, title, params, template) {
    if (!template) {
        template = 'plain-text';
    }
    if(mailerConfig.turnOff===true){
        console.log('Mailer is turned off');
        return false;
    }
    if(!checkDomainExist(empEmail)){
        console.log('Restricted Domain');
        return false;
    }
    
     templates.render('../../../server/config/email-templates/' + template + '.html', params, function (err, html, text, subject) {
        if (!err) {
            var mailOptions = {
                from: 'Admin <' + mailerConfig.username + '>', // sender address
                to: empEmail, // list of receivers
                subject: title, // Subject line
                html: html // html body
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                } else {
                    console.log('Mail Has Been sent to : ' + empEmail + 'with info' + info);
                }
            });
        }else{
            console.log('Some Error occured while fetching Mail Template',err);
        }

    });
}