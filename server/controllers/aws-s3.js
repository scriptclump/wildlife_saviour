// Initialize aws client
// =====================
//var config = require('../config/development.json');
var Knox = require('knox');
var moment = require('moment');
var crypto = require('crypto');
var config = require('../config/config');
var mailConfig = require('../config/config')['aws'];
var mailListnerModels = require('mongoose').model('ticket');


// Create the knox client with your aws settings
Knox.aws = Knox.createClient({
    key: config.aws.AWS_ACCESS_KEY_ID,
    secret: config.aws.AWS_SECRET_ACCESS_KEY,
    bucket: config.aws.S3_BUCKET_NAME,
    region: 'us-east-1'
});

// S3 upload service - stream buffers to S3
// ========================================
var s3UploadService = function (attachment, ticketID) {
    console.log('s3UploadService was triggered with ID', ticketID);
    //console.log(attachment,'from s3UploadService');
    //console.log(attachment);
    //var datePrefix = moment().format('YYYY[/]MM');

    var min = 1;
    var max = 50;
    var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log('Random_number_generated',randomNum);
    var key = ticketID;
    var hashFilename = key + '-' +randomNum+'-'+attachment.fileName;

    var pathToArtwork = '/ticket_attachments/' + hashFilename;

    var headers = {
        'Content-Length': attachment.length,
        'Content-Type': 'mimetype',
        'x-amz-acl': 'public-read'
    };

    Knox.aws.putBuffer(attachment.content, pathToArtwork, headers, function (err, response) {
        if (err) {
            console.error('error streaming image: ', new Date(), err);
            return err;
        }
        if (response.statusCode !== 200) {
            console.error('error streaming image: ', new Date(), err);
            return err;
        }
        var attachment_url = response.req.url;
        //return response.req.url;
        //next();
        mailListnerModels.findOne({ticketID: ticketID}, function (err, res) {
            if (err) {
                console.log(ticketID, 'if block');
                console.log('findone did not executed');
            } else {
                console.log(ticketID, 'else block');
                //console.log(res,'ticket Found');
                if (res) {
                    mailListnerModels.update({_id: res._id}, {$push: {img_Path: attachment_url}},
                            function (err, suc) {
                                if (err) {
                                    console.log('Updateion Failed');
                                } else {
                                    console.log('Updation successfull');
                                }
                                ;
                            });
                }
            }
            ;
        });
    });

};

module.exports = s3UploadService;



