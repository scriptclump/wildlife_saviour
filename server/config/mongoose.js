var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
module.exports = function (config) {
    mongoose.Promise = require('bluebird');
    mongoose.connect(config.db);
    var db = mongoose.connection;
    autoIncrement.initialize(db);
    db.on('error', console.error.bind(console, 'Error Connecting to DB'));
    db.once('open', function callback() {
        console.log('Connected to IT Help Desk DB');
    });
};