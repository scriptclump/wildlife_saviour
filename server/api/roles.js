var express = require('express');
var router = express.Router({strict: true});
var passport = require('passport');


var roleController = require('../controllers/roles');

router.use(function (req, res, next) {
    next();
});

router.post('/create-role', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Inside Create Role Router');
    roleController.createNewRole(req, res);
});

router.post('/update-role', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Inside Update Role Router');
    roleController.updateRolePrivileges(req, res);
});

router.get('/privileges',passport.authenticate('jwt', {session: false}), function (req, res) {
	roleController.getPrivileges(res);
});

router.post('/role-privileges', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Inside Create Role Privileges');
    roleController.createRolePrivilegesMap(req, res);
});

router.get('/get-roles',passport.authenticate('jwt', {session: false}), function (req, res) {
	roleController.getRolesList(res);
});

router.get('/view-roles',passport.authenticate('jwt', {session: false}), function (req, res) {
	roleController.getRolesList(res);
});

router.post('/assign-roles', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Inside Assign Roles Router');
    roleController.assignRoles(req, res);
});

router.post('/get-user-roles', passport.authenticate('jwt', {session: false}), function (req, res) {
    console.log('Inside Get User Roles Router');
    roleController.getUserRoles(req, res);
});

router.post('/get-role-privileges',passport.authenticate('jwt', {session: false}), function (req, res) {
	roleController.getRolePrivilegesList(req, res);
});



module.exports = router;
