/**
 * Created by CGI on 07/12/2016.
 */

var express = require('express');
var router = express.Router();

var searchController = require('../controllers/search');

router.post('/search-range', function (req, res) {

    searchController.searchByDateRange(req, res);
})
        .post('/search-application', function (req, res) {
            searchController.searchByApplication(req, res);
        });
module.exports = router;