var express = require('express');
var router = express.Router();
var User = require('../models/member-auth.js');
var passport = require('passport');
var jwt = require('jwt-simple');
var generatePassword = require("password-generator");
var config = require('../config/config');
var mailer = require('../controllers/mailer.js');
var Members = require('mongoose').model('Member');
var userAuthority = require('../models/user-authority');
var userAuthorityModel = require('mongoose').model('Authority');
var roles = require('../models/roles');
var roleModel = require('mongoose').model('Roles');
var role_privilege = require('../models/roles_previleges');
var roleprivilegesModel = require('mongoose').model('role_privilege');
var applicationUrl = config.applicationUrl;

router.post('/signup', function (req, res) {
    //console.log('request body',req.body)=''

    req.body.email = 'admin@charterglobal.com';
    req.body.password = 'admin';
    var memberBody = {
        accessRole: "admin",
        designation: "Administrator",
        email: req.body.email,
        empID: "EMP_0000",
        fName: "IT",
        lName: "Admin",
        location: "Hyderabad",
        mNum: 9030207601
    }
    if (!req.body.email || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new User({
            email: req.body.email,
            password: req.body.password
        });
        // save the user
        newUser.save(function (err, newUser) {
            if (err) {
                return res.json({success: false, msg: 'Username already exists.'});
            } else {
                var newUserID = newUser._id;
                Members.create(memberBody, function (err, memData) {
                    if (err) {
                        res.status(400);
                        return res.json({msg: err});
                    } else {
                        var profileID = memData._id;
                        User.findByIdAndUpdate(newUserID, {$set: {profileRef: profileID}}, function (err, updatedData) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.status(200);
                                return res.json({success: true, msg: 'Successful created new user.'});
                            }
                        });

                    }
                })
            }
        });
    }
});

router.post('/authenticate', function (req, res) {
    //console.log(req.body);
    var userObj = {};
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err)
            throw err;

        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    //console.log(config.secret);
                    var token = jwt.encode(user, config.secret);
                    Members.find({_id: user.profileRef}, function (err, details) {
                        if (err) {
                            console.log("user details not found", err);
                            res.json({success: true, token: userObj});
                        } else {
                            console.log("user details :: ", details[0]);
                            var email = details[0].email;
                            var userPrivileges = [];
                            var iteratorCount = 0;
                            if (email != "") {
                                userAuthorityModel.find({email: email}).populate('role_id').exec(function (err, data) {
                                    if (err) {
                                        //return res.status(500).json("Internal Server Error");
                                        res.json({success: true, token: 'JWT ' + token, user: details[0], privileges: userPrivileges});
                                    } else {
                                        console.log('Roles Data :: ' + data);
                                        for (var i = 0; i < data.length; i++) {
                                            console.log("Data :: ",data[i]);
                                            var id = data[i].role_id.role_id;
                                            console.log(id);
                                            console.log('role_id :: ' + id);
                                            roleprivilegesModel.find({role_id: id}).populate('privilege_ref').exec(function (err, privdata) {
                                                console.log('Inside roleprivilegesModel');
                                                iteratorCount++;
                                                if (err) {
                                                    console.log('Inside roleprivilegesModel Error');
                                                    res.json({success: true, token: 'JWT ' + token, user: details[0], privileges: userPrivileges});
                                                    //return res.status(500).json("Internal Server Error");
                                                } else {
                                                    console.log('Role privilege Data :: ', privdata);
                                                    for (var priv = 0; priv < privdata.length; priv++) {
                                                        var privilege_id = privdata[priv].privilege_ref.privilege_id;
                                                        console.log('privilege_id :: ', privilege_id);
                                                        userPrivileges.push(privilege_id);
                                                    }
                                                    ;
                                                    console.log("userPrivileges :: ", userPrivileges);
                                                    if (iteratorCount == data.length) {
                                                        console.log('Response Before');
                                                        res.json({success: true, token: 'JWT ' + token, user: details[0], privileges: userPrivileges});
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});
router.post('/reset-password', function (req, res) {
    //console.log(req.body);
    var pwd = generatePassword(10, true);
    var payload = {
        password: pwd
    };
    User.findOneAndUpdate({'email': req.body.email}, payload, {upsert: false}, function (err, doc) {
        //console.log(err);
        //console.log(doc)
        if (err) {
            return res.status(500).json(err);
        } else {
            //console.log('')
           if (doc) {
                //var content = "Your Password has been reset. use these credentials to login " + req.body.email + " Password: " + pwd;

              Members.findOne({email: req.body.email}, function (err, userinfo) {
                   if (err) {
                       console.log("user details not found", err);

                   } else {
                    if(userinfo){
                      console.log('userinfo...');
                      //console.log(userinfo);
                      
                      var fName = userinfo.fName;
                      var lName = userinfo.lName;
                      
                      
                      // console.log('fname: '+fName);
                      // console.log('lname: '+lName);
                       var params = {
                        applicationUrl: applicationUrl,
                          email:req.body.email,
                          pwd:pwd,
                          fName:fName,
                          lName:lName
                        }  
                      
                      
                 }}
                 mailer.mailerService(req.body.email, 'Help Desk Reset Password', params,'reset-password');
             });
                
                // var params={
                //     email:req.body.email,
                //     pwd:pwd,
                    
                //  }
                // mailer.mailerService(req.body.email, 'Help Desk Reset Password', params,'reset-password');
                res.status(200);
                res.send({success: true, msg: 'User password has been reset. Please check your email.'});
                //res.json(doc);
            } else {
                return res.json({reason: 'User does not exist.'});
            }
        }
    });
})
//var async = require('async');
router.post('/update-password', function (req, res) {
    //console.log(req.body);
    var payload = {
        password: req.body.npwd
    };
    //console.log('first');
    if (req.body.npwd) {
        User.findOneAndUpdate({'email': req.body.email}, payload, {upsert: false}, function (err, doc) {
            if (err) {
                console.log('error occured in user update');
                return res.status(500).json(err);
            } else {
                if (doc) {
                    console.log('sucess updated');
                    res.status(200);
                    res.send({success: true, msg: 'User Profile Updated Sucessfully'});
                } else {
                    return res.json({reason: 'User profile has been updated'});
                }
            }
        });
    }
    //console.log('last of the program');
});

// updating profile information 
router.post('/update-info', function (req, res) {
    console.log("update-info :: ", req.body);
    var updatedetails = {
        fName: req.body.fName,
        lName: req.body.lName,
        mNum: req.body.mNum,
        aNum: req.body.aNum,
        email: req.body.email,
        empID: req.body.empID,
        location: req.body.location,
        designation: req.body.designation
    };
    //console.log('first');
    if (req.body.email) {
        Members.findOneAndUpdate({'email': req.body.email}, updatedetails, function (err, doc) {
            if (err) {
                console.log('error occured in user update');
                return res.status(500).json(err);
            } else {
                if (doc) {
                    console.log('Sucessfully updated profile.....');
                    res.status(200);
                    res.send({success: true, msg: 'User Profile Updated Sucessfully'});
                } else {
                    return res.json({reason: 'User profile has been updated'});
                }
            }
        });
    }
    //console.log('last of the program');
});


router.get('/memberinfo', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Member info called', token);
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            name: decoded.name
        }, function (err, user) {
            if (err)
                throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                res.json({success: true, msg: 'Welcome in the member area ' + user.email + '!'});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/change-Password', function (req, res) {

    var payload = {
        password: req.body.newPwd
    };

    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err)
            throw err;

        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            user.comparePassword(req.body.currPwd, function (err, isMatch) {
                if (isMatch && !err) {
                    User.findOneAndUpdate({'email': req.body.email}, payload, {upsert: false}, function (err, doc) {
                        if (err) {
                            console.log('error occured in user update');
                            return res.status(500).json(err);
                        } else {
                            if (doc) {
                                res.status(200);
                                console.log('password changed successfully');
               Members.findOne({email: req.body.email}, function (err, userinfo) {
                                //send email
                                if (err) {
                       console.log("user details not found", err);

                   }else {
                    if(userinfo){
                        console.log('userinfo...');
                        console.log(userinfo);

                        var fName = userinfo.fName;
                      var lName = userinfo.lName;

                      console.log('fname: '+fName);
                       console.log('lname: '+lName);
                                var params = {
                                    applicationUrl: applicationUrl,
                                    email: req.body.email,
                                    pwd: req.body.newPwd,
                                    fName:fName,
                                    lName:lName
                                }}}
                                mailer.mailerService(req.body.email, 'Help Desk Change Password', params, 'change-password');
    });                      
                                res.send({success: true, msg: 'password changed successfully'});
                            }else {
                                return res.json({reason: 'oops! password unable to change'});
                            }
                        }
                    });
                } else {
                    res.send({success: false, msg: 'Invalid Current Password'});
                }
            });
        }
    });
});
getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;


//var createGlobalGroup = function (socket, data) {
//        async.waterfall(
//                [
//                    /**
//                     * this function is required to pass data recieved from client
//                     * @param  {Function} callback To pass data recieved from client
//                     */
//
//                    function (callback) {
//                        console.log('started');
//                        callback(null, socket, data);
//                    },
//                    /**
//                     * Step 1: Verify User
//                     */
//                    verifyUser,
//                    /**
//                     * Step 2: Check User Access Rights And Roles
//                     */
//                    checkUserAccessRightsAndRoles,
//                    /**
//                     * Step 3: Create Project
//                     */
//                    createNewGlobalGroup], function (err, result) {
//            /**
//             * function to be called when all functions in async array has been called
//             */
//            console.log('project created ....');
//        });
//    }
//    verifyUser = function (socket, data, callback) {
////do your query
//        /**
//         * call next function in series
//         * provide sufficient input to next function
//         */
//        console.log('varify user called');
//        callback(null, socket, data, {
//            "isValidUser": true,
//        });
//    }
//
//    checkUserAccessRightsAndRoles = function (socket, data, asyncObj, callback) {
//        //do your query
//        console.log()
//        if (condition) {
//            callback(null, socket, data, {
//                roles: result,
//                "isValidUser": asyncObj.isValidUser,
//                "userId": asyncObj.userId,
//            });
//        } else {
//            //no call back
//        }
//    }
//
//    var createNewGlobalGroup = function (socket, data, asyncObj, callback) {
////wanna stop then no callback
//    }
//    createGlobalGroup(req, res).then(function(data){
//        console.log('this one called without data',data);
//    }).error(function(error){
//        console.log(error);
//    })

//console.log(req.body);
//var pwd = generatePassword(10, true);
//  if (!req.body.npwd || !req.body.email) {

//    console.log(req.body.email);
//    if (!req.body.email) {
//        return res.status(500).json({msg: 'Please provide details'});
//    }
//
//    console.log(req.body.npwd);
//    if (req.body.npwd == null || req.body.npwd == 'undefined')
//        req.body.npwd = null;
//
//    console.log(req.body.accessRole);
//    if (req.body.accessRole == null || req.body.accessRole == 'undefined')
//        req.body.accessRole = null;
// User.findOne({'email': req.body.email}, function (err, doc)
//    {
//
//        if (err)
//            // throw err;
//            console.log("user details not found", err);
//        if (doc) {
//
//            var userid = doc.profileRef;
//
//            if (payload.password != null && payload.accessRole == null)
//            {
//                console.log('updating password....');
//                User.Update({'email': req.body.email}, {$set: {password: req.body.npwd}}, {upsert: false}, function (err, doc) {
//
//                    if (err) {
//                        return res.status(500).json(err);
//                    } else {
//                        if (doc) {
//                            res.status(200);
//                            console
//                            res.send({success: true, msg: 'User password has been updated'});
//                            //res.json(doc);
//                        } else {
//                            return res.json({reason: 'User does not exist.'});
//                        }
//                    }
//                });
//            } else if (payload.password == null && payload.accessRole != null) {
//                console.log("Member Role updating...");
//                Members.find({_id: userid}, function (err, userinfo) {
//                    if (err) {
//                        console.log("user details not found", err);
//
//                    } else {
//
//                        console.log('userinfo...');
//                        //console.log(req.body.accessRole);
//                        //console.log(userinfo[0].accessRole);
//                        //console.log(userinfo);
//
//                        if (userinfo[0].accessRole === req.body.accessRole)
//                        {
//                            console.log("Access Role is already assigned");
//                            res.send({success: true, msg: 'Access Role is already assigned.'});
//                        } else
//                        {
//                            console.log("Access Role is updating...");
//                            Members.findOneAndUpdate({email: req.body.email}, {$set: {accessRole: payload.accessRole}},
//                                    function (err, details) {
//                                        if (err) {
//                                            console.log("user details not found", err);
//                                        } else {
//                                            console.log("Access Role is updated....");
//                                            res.send({success: true, msg: 'User profile has been updated'});
//                                        }
//                                    });
//                        }
//                    }
//
//                });
//            } else if (payload.password != null && payload.accessRole != null) {
//                console.log('Updating password & Role....');
//                console.log(payload.password);
//                console.log(payload.accessRole);
//
//                User.findOneAndUpdate({'email': req.body.email},
//                        {$set: {password: req.body.npwd}},
//                        {upsert: false}, function (err, doc) {
//
//
//                    if (err) {
//                        return res.status(500).json(err);
//                    } else {
//                        if (doc) {
//                            console.log('User password has been updated');
//                            res.status(200);
//                            res.send({success: true, msg: 'User password has been updated.Please Login using new password'});
//                            //res.json(doc);
//
//                        } else {
//                            return res.json({reason: 'User does not exist.'});
//                        }
//                    }
//                });
//
//                // console.log(doc);
//
//                Members.find({_id: userid}, function (err, userinfo) {
//                    if (err) {
//                        console.log('user details not found', err);
//
//                    } else {
//
//                        console.log('userinfo...');
//                        //console.log(req.body.accessRole);
//                        //console.log(userinfo[0].accessRole);
//                        //console.log(userinfo);
//
//                        if (userinfo[0] && userinfo[0].accessRole === req.body.accessRole)
//                            console.log('Access Role is already assigend');
//                        else
//                        {
//                            console.log('Access Role is updating...');
//                            Members.findOneAndUpdate({email: req.body.email}, {$set: {accessRole: payload.accessRole}},
//                                    function (err, details) {
//                                        if (err) {
//                                            console.log('user details not found', err);
//                                        } else {
//                                            console.log('Access Role is updated....');
//                                            res.send({success: true, msg: 'User profile has been updated.'});
//                                        }
//                                    });
//                        }
//                    }
//
//                });
//
//            }
//
//        }

//});