var express = require('express');
var router = express.Router();
var dashboardController = require('../controllers/dashboard');

router.use(function(req, res, next) {
    next();
});

router.get('/incidents', function(req, res){

    dashboardController.getLatestIncidents(res);

});

router.get('/changes', function(req, res){
    dashboardController.getLatestChanges(res);
});

router.get('/requests', function(req, res){

    dashboardController.getLatestRequests(res);

});

router.get('/incidents-month', function(req, res){
    dashboardController.getMonthStats(res, 'Defect');
});

router.get('/changes-month', function(req, res){
    dashboardController.getMonthStats(res, 'Change Request');
})

module.exports = router;