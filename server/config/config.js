var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');
//console.log('port number listening',process.env.PORT);
module.exports = {
    development: {
        //db:'mongodb://sai:password@ds011241.mlab.com:11241/it-help-desk',
        //db:'mongodb://devdb:password@ds153775.mlab.com:53775/it-help-desk-dev',
        db:'mongodb://127.0.0.1/wildlifeSaviour',
        rootPath: rootPath,
        port: process.env.PORT || 9000
    },
    production: {
        rootPath: rootPath,
        //db: 'mongodb://sai:password@ds011241.mlab.com:11241/it-help-desk',
        db:'mongodb://127.0.0.1/wildlifeSaviour',
        //db:'mongodb://devdb:password@ds153775.mlab.com:53775/it-help-desk-dev', // development environment
        port: process.env.PORT || 9000
    },
    opLogPath:{
        db:'mongodb://127.0.0.1/local',
    },
    mailListener: {
//        username: "ithelpdesk@charterglobal.com",
//        password: "Charter5225",
    	username: "bsharma@charterglobal.com",
        password: "S3curity#67",
        host: "outlook.office365.com",
        port: 993,
        tls: true,
        tlsOptions: {rejectUnauthorized: false},
        mailbox: "INBOX",
        markSeen: true,
        fetchUnreadOnStart: false,
        attachments: true,
        keepalive: true,
        attachmentOptions: {directory:"./public/attachments/"},
        smtpHost:'smtp.office365.com',
    },
    mailer:{
//        username: "ithelpdesk@charterglobal.com",
//        password: "Charter5225",
    	username: "bsharma@charterglobal.com",
        password: "S3curity#671",
        smtpHost:'smtp.office365.com',
        turnOff:false
    },
    aws: {
       AWS_ACCESS_KEY_ID: "AKIAJ22YY3WKVYDY6SBA",
       AWS_SECRET_ACCESS_KEY: "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",
       S3_BUCKET_NAME: "wildlife-saviour"
    },
    secret: '1ZcckOmDkZ6tnc5SW781iG1ZY3G7383G',
    mailDomainsAllowed:['gmail','outlook','charterglobal'],
    //local - To save attachments in Local folder
    //aws - To save attachments in AWS Server
    attachmentstype: 'local',
    // applicationUrl used to send in email to the registered users
    applicationUrl: 'http://127.0.0.1:9000',
    // attachmentsPath is the folder location to save attachments
    attachmentsPath: '/attachments/',
    // Default Employee Role Id
    employeeRoleId: '5810ab895483160d70305799'

}