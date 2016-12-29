
var Roles = require('../models/roles');
var roleModel = require('mongoose').model('Roles');
var privileges = require('../models/privileges');
var privilegesModel = require('mongoose').model('privileges');
var role_privilege = require('../models/roles_previleges');
var roleprivilegesModel = require('mongoose').model('role_privilege');
var user_authority = require('../models/user-authority');
var user_authorityModel = require('mongoose').model('Authority');

var _this = this;

exports.createNewRole = function (req, res) {
    var roledata = req.body;
	var id = roledata.id === undefined ? roledata.body.id : roledata.id;
	var name = roledata.rolename === undefined ? roledata.body.rolename : roledata.rolename;
	var desc = roledata.roledesc === undefined ? roledata.body.roledesc : roledata.roledesc;
	var privileges = roledata.privileges === undefined ? roledata.body.privileges : roledata.privileges;
	console.log("Server Create Role ","Role id :: ",id," :: Role name :: ",name," :: Role desc :: ",desc," :: Role privileges :: ",privileges);
	roleModel.find({name: name},function (err, data) {
		console.log("Error while creating role :: ",data);
		if (err || data.length > 0){
            res.status(400);
            return res.json({msg: 'Role Name already exists.'});
		}else{
			roleModel.create({
				role_id: id,
				name: name,
				desc : desc
			}, function (err, create) {
				if (err) {
					console.log("Error while creating role :: ",err);
		            res.status(400);
		            return res.json({msg: 'Error while creating role.'});
				} else {
					console.log('Role Created Successfully with ID', create.role_id);
					for (var i = 0; i < privileges.length; i++) {
						var privilegeid = privileges[i];
						roleprivilegesModel.create({
							role_id: id,
							privilege_ref: privilegeid
						}, function (err, data) {
			                if (err) {
			                	Roles.findByIdAndRemove(id, {},
			                            function (err, obj) {
			                                if (err) {
			                                    console.log('error occured while removing user');
			                                } else {
			                                    console.log('Created Role rolled back');
			                                }
			                            }
			                    );
			                    console.log(err);
			                    res.status(400);
			                    return res.json({msg: 'Some reason privileges for the role failed to save.'});
			                } else {
			                    
			                }
			            });
					}
					res.status(200);
		            res.json({msg: 'Role Created successfully'});
				}
			});
		}
	});
};

exports.updateRolePrivileges = function (req, res) {
	console.log('Inside Update Role Server');
    var roledata = req.body;
	var id = roledata.id === undefined ? roledata.body.id : roledata.id;
	var privileges = roledata.privileges === undefined ? roledata.body.privileges : roledata.privileges;
	console.log("in server ","id :: ",id," :: privileges :: ",privileges);
	var existinglist = [];
	roleprivilegesModel.find({role_id: id}, function (err, data) {
		if (err){
		    return res.status(500).json("Internal Server Error");
		}else{
			existinglist = data;
			console.log('existinglist :: ' + existinglist.length);
			if(existinglist.length > 0){
				for (var i = 0; i < existinglist.length; i++) {
					var existid = existinglist[i]._id;
					roleprivilegesModel.findByIdAndRemove(existid, {},
				            function (err, obj) {
				                if (err) {
				                    console.log('error occured while removing user');
				                } else {
				                    console.log('Removed successfully :: ',existid);
				                }
				            }
				    );
				}
			}
			for (var i = 0; i < privileges.length; i++) {
				var privilegeid = privileges[i];
				roleprivilegesModel.create({
					role_id: id,
					privilege_ref: privilegeid
				}, function (err, data) {
	                if (err) {
	                    console.log(err);
	                    res.status(400);
	                    return res.json({msg: 'Some reason privileges for the role failed to save.'});
	                } else {
	                    
	                }
	            });
			}
			res.status(200);
            res.json({msg: 'Role Created successfully'});
		}
	});
};

exports.getPrivileges = function (res) {
	privilegesModel.find().limit(100).exec(function (err, docs) {
		if (err)
		    return res.status(500).json("Internal Server Error");
			console.log('Data Coming' + docs);
			res.status(200).json(docs);
	});
};

exports.getRolesList = function (res) {
	roleModel.find().limit(100).exec(function (err, data) {
		if (err){
		    return res.status(500).json("Internal Server Error");
		}else{
			res.status(200).json(data);
		}
	});
};

exports.getRolePrivilegesList = function (req, res) {
    var roledata = req.body;
	var id = roledata.role_id === undefined ? roledata.body.role_id : roledata.role_id;
	roleprivilegesModel.find({role_id: id}).populate('privilege_ref').exec(function (err, data) {
		if (err){
		    return res.status(500).json("Internal Server Error");
		}else{
			res.status(200).json(data);
		}
	});
};

exports.assignRoles = function (req, res) {
    var roledata = req.body;
	var username = roledata.email === undefined ? roledata.body.email : roledata.email;
	var roles = roledata.roles === undefined ? roledata.body.roles : roledata.roles;
	var existinglist = [];
	user_authorityModel.find({email: username}, function (err, data) {
		if (err){
		    return res.status(500).json("Internal Server Error");
		}else{
			existinglist = data;
			if(existinglist.length > 0){
				for (var i = 0; i < existinglist.length; i++) {
					var existid = existinglist[i]._id;
					user_authorityModel.findByIdAndRemove(existid, {},
				            function (err, obj) {
				                if (err) {
				                    console.log('error occured while removing user');
				                } else {
				                    console.log('Removed successfully :: ',existid);
				                }
				            }
				    );
				}
			}
			addUserRoles(username, roles, function (result) {
		        if (result.sucess === false) {
		            return res.send(result.msg);
		        } else {
		            res.status(200);
		            return res.send(result.msg);
		        }
		    });
		}
	});
};

exports.getUserRoles = function (req, res) {
    var userRoledata = req.body;
	var email = userRoledata.email === undefined ? userRoledata.body.email : userRoledata.email;
	user_authorityModel.find({email: email}).populate('role_id').exec(function (err, data) {
		if (err){
		    return res.status(500).json("Internal Server Error");
		}else{
			console.log('Roles Data Server :: ' + data);
			res.status(200).json(data);
		}
	});
};

var addUserRoles = function (email, roles, callback) {
	for (var i = 0; i < roles.length; i++) {
		var roleid = roles[i];
		console.log('roleid :: ',roleid);
		user_authorityModel.create({
			email: email,
			role_id: roleid
		}, function (err, data) {
            if (err) {
                console.log(err);
                callback({sucess: false, msg: 'Failed to assign Roles to Member'});
            } else {
    			console.log('Role Assigned with ID', data);
            }
        });
	}
	callback({sucess: true, msg: "Roles assigned successfully"});
}


