/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var privilegeSchema = mongoose.Schema({
    privilege_id: {
    	type: String, 
    	unique: true, 
    	uppercase: true
    },
    name: {
    	type: String
    },
    desc: {
    	type: String
    }
});
var privileges = mongoose.model('privileges', privilegeSchema);
module.exports = privileges;