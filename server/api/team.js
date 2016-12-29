/**
 * Created by Pkp on 5/14/2016.
 */

var express = require('express');
var router = express.Router();
var teamController = require('../controllers/team');
var passport = require('passport');


// for importing Functionality

    var multer = require('multer');
    var xlstojson = require("xls-to-json-lc");
    var xlsxtojson = require("xlsx-to-json-lc");
    


router.use(function (req, res, next) {
    next();
});

router.post('/add-member', passport.authenticate('jwt', {session: false}), function (req, res) {
    //var token = getToken(req.headers);
    //console.log(token);
    teamController.addMember(req, res);
});

router.get('/members',passport.authenticate('jwt', {session: false}), function (req, res) {
    teamController.membersList(res);
});

router.post('/member-detail',passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('entered Member Detail Controller',req.body.memberID);
    teamController.getMemberById(req.body.memberID, res);
});

router.post('/update-memberinfo',passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('entered Member Detail Controller',req.body.memberID);
    teamController.updateMemberinfo(req.body, res);
});

router.post('/update',passport.authenticate('jwt', {session: false}), function (req, res) {
    teamController.updateIncident(req.body, res);
})

// importing function for primary execution calls
var storage = multer.diskStorage({                  
                    destination: function (req, file, cb) {
                        cb(null, '../config/attachments/member-sheets/')
                    },
                    filename: function (req, file, cb) {
                        var datetimestamp = Date.now();
                        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
                    }
                });

            var upload = multer({ //multer settings
                            storage: storage,
                            fileFilter : function(req, file, callback) { 
                                console.log('file received',file);
                            //file filter
                                if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                                    return callback(new Error('Wrong extension type'));
                                }
                                callback(null, true);
                            }
 }).single('file');

// Import Members
router.post('/import-members', function(req, res) {
        console.log('received Request');
        var exceltojson;
        upload(req,res,function(err){
            console.log(req.files);
            console.log(req.file);
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            // if(!req.file){
            //     res.json({error_code:1,err_desc:"No file passed"});
            //     return;
            // }
           
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders:true
                }, function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    } 
                          // for(var i=0; i<=result.length;i++){
             
                          //     console.log('Members Details Data:::: ', result[i]);
                          //     if(result[i]){
                          //       console.log('from team router',result[i]);
                          //     teamController.importMemberInsert(result[i], res);               // calling functionality for save
                          //    }
                          // }
                     
                    res.json({error_code:0,err_desc:null, data: result});

                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
       
    });





module.exports = router;
