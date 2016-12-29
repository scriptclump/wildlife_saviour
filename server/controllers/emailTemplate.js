exports.addEmailTemplate = function (req, res) {
    var memberBody = req.body;
    var pwd = generatePassword(10, true);
    var email = memberBody.email;
    var roleid = memberBody.accessRole;
    var newUser = new User({
        email: memberBody.email,
        password: pwd
    });
    newUser.save(function (err, data) {
        if (err) {
            //console.log(err);
            res.status(400);
            return res.json({msg: 'User email already exists.'});
        } else {
            var newEmailTemplateID = data._id;
            //console.log(memberBody);
            EmailTemplates.create(memberBody, function (err, data) {
                if (err) {
                    User.findByIdAndRemove(newEmailTemplateID, {},
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
                    //console.log('Data added content',data);
                    //var content = "Your account has been registered. Please login using below credentials Email ID:" + memberBody.email + " Password: " + pwd;
                    var params={
                        email_ID:memberBody.email,
                        pwd : pwd
                    };
                    mailer.mailerService(memberBody.email, 'Help Desk login credentials', params,'template-newmember');
                    var profileID = data._id;
                    User.findByIdAndUpdate(newEmailTemplateID, {
                        $set: {profileRef: profileID}
                    	},function (err, updatedData) {
                                if (err) {
                                    res.send(err);
                                    //console.log(err);
                                } else {
                                    //res.send(tank);
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
//var generateIncId = function () {
//    var date = new Date();
//    var incId = "IM" + date.getFullYear().toString() + date.getDate().toString() + (date.getMonth() + 1).toString() + date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString();
//    return incId;
//}
exports.getEmailTemplateById = function (incId, res) {
    //console.log('member ID received',incId);
    EmailTemplates.find({_id: incId}, function (err, details) {
        if (err) {
            console.log("error");
            return res.status(500).json("Internal Database error");
        };
        //console.log('details found as ',details)
        res.status(200).json(details[0]);
    });

}
exports.updateEmailTemplate = function (payLoad, res) {
    EmailTemplates.findOneAndUpdate({'incidentID': payLoad.incidentID}, payLoad, {upsert: true}, function (err, doc) {
        if (err)
            return res.status(500).json(err);
        //console.log(doc);
        res.status(200).json(doc);
    });
}
exports.emailTemplateList = function (res) {
    EmailTemplates.find()
            .limit(100)
            .exec(function (err, docs) {
                if (err)
                    return res.status(500).json("Internal Server Error");
                res.status(200).json(docs);
            });

}
exports.updateEmailTemplateinfo = function (body, res) {
    console.log("update EmailTemplate info called");
    EmailTemplates.findOneAndUpdate({email: body.email},
            {$set: {accessRole: body.accessRole}},
            function (err, details) {
                if (err) {
                    //console.log("user details not found", err);
                    res.status(500);
                    res.json({success: false, msg: err});
                } else {
                    //console.log("Access Role is updated....");
                    res.status(200);
                    res.json({success: true, msg: 'User profile has been updated'});
                }
            });

}
