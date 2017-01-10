var Member = require('../models/members');
var Members = require('mongoose').model('Member');
var generatePassword = require("password-generator");
var User = require('../models/member-auth.js');
var user_authority = require('../models/user-authority');
var user_authorityModel = require('mongoose').model('Authority');

var config = require('../config/config');
var applicationUrl = config.applicationUrl;

var mailer = require('./mailer.js');
exports.addMember = function (req, res) {
    var memberBody = req.body;
    var pwd = generatePassword(10, true);
    var email = memberBody.email;
    var roleid = memberBody.accessRole||config.employeeRoleId;
    var newUser = new User({
        email: memberBody.email,
        password: pwd
    });
    newUser.save(function (err, data) {
        if (err) {
            res.status(400);
            return res.json({msg: 'User email already exists.'});
        } else {
            var newMemberID = data._id;
            Members.create(memberBody, function (err, data) {
                if (err) {
                    User.findByIdAndRemove(newMemberID, {},
                            function (err, obj) {
                                if (err) {
                                    console.log('error occured while removing user');
                                } else {
                                    console.log('user login details rolled backed');
                                }
                            }
                    );
                    console.log(err);
                    res.status(400);
                    return res.json({msg: 'Employee ID already exists '});
                } else {
                	var name = memberBody.fName+" "+memberBody.lName;
                	var params={
                    	applicationUrl: applicationUrl,
                    	name: name,
                    	email_ID: memberBody.email,
                        pwd : pwd
                    };
                    mailer.mailerService(memberBody.email, 'Help Desk login credentials', params,'template-newmember');
                    var profileID = data._id;
                    User.findByIdAndUpdate(newMemberID, {
                        $set: {profileRef: profileID}
                    	},function (err, updatedData) {
                                if (err) {
                                    res.send(err);
                                } else {
                                    console.log("updatedData :: ",updatedData);
                            		user_authorityModel.create({
                            			email: email,
                            			role_id: roleid
                            		}, function (err, data) {
                                        if (err) {
                                            console.log(err);
                                            res.status(400);
                                            res.json({msg: 'Some reason assigning role failed to save.'});
                                        } else {
                                			console.log('Role Assigned with ID', data);
                                            res.status(200);
                                            res.json(memberBody.email);
                                        }
                                    });
                                }
                         });
                    // save the user
                }
            });
        }

    });
};

exports.getMemberById = function (incId, res) {
    Members.find({_id: incId}, function (err, details) {
        if (err) {
            console.log("error");
            return res.status(500).json("Internal Database error");
        };
        res.status(200).json(details[0]);
    });

}
exports.updateMember = function (payLoad, res) {
    Members.findOneAndUpdate({'incidentID': payLoad.incidentID}, payLoad, {upsert: true}, function (err, doc) {
        if (err)
            return res.status(500).json(err);
        res.status(200).json(doc);
    });
}
exports.membersList = function (res) {
	params = {'email': {$ne: 'superuser@charterglobal.com'}}
    Members.find(params,function (err, docs) {
                if (err)
                    return res.status(500).json("Internal Server Error");
                res.status(200).json(docs);
            });

}
exports.updateMemberinfo = function (body, res) {
    console.log("update Member info called");
    Members.findOneAndUpdate({email: body.email},
            {$set: {accessRole: body.accessRole}},
            function (err, details) {
                if (err) {
                    res.status(500);
                    res.json({success: false, msg: err});
                } else {
                    res.status(200);
                    res.json({success: true, msg: 'User profile has been updated'});
                }
            });

}

/*
 * This method used to import members 
 */
exports.importMemberInsert = function(data, res){
    var pwd = generatePassword(10, true);
    console.log('Email from data :::', data.email,"Details from data ::: ",data);
    var newUser = new User({
        email: data.email,
        password: pwd
    });
        
    newUser.save(function (err, data) {
        if (err) {
        } else {
            var newMemberID = data._id;
            Members.create(data, function (err, data) {
                if (err) {
                    User.findByIdAndRemove(newMemberID, {},
                            function (err, obj) {
                                if (err) {
                                    console.log('error occured while removing user');
                                } else {
                                    console.log('user login details rolled backed');
                                }
                            }
                    );
                    console.log(err);
                    res.status(400);
                    return res.json({msg: 'Employee ID already exists '});
                } else {
                    var name = data.fName+" "+data.lName;
                    var params={
                        applicationUrl: applicationUrl,
                        name: name,
                        email_ID: data.email,
                        pwd : pwd
                    };
                    mailer.mailerService(data.email, 'Help Desk login credentials', params,'template-newmember');
                    var profileID = data._id;
                    User.findByIdAndUpdate(newMemberID, {
                        $set: {profileRef: profileID}
                        },function (err, updatedData) {
                                if (err) {
                                    res.send(err);
                                } else {
                                    user_authorityModel.create({
                                        email: email,
                                        role_id: roleid
                                    }, function (err, data) {
                                        if (err) {
                                            console.log(err);
                                            res.status(400);
                                            res.json({msg: 'Some reason assigning role failed to save.'});
                                        } else {
                                            console.log('Role Assigned with ID', data);
                                            res.status(200);
                                            res.json(data.email);
                                        }
                                    });
                                }
                         });
                    // save the user
                }
            });
        }

    });
}

