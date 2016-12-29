/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Schema = mongoose.Schema;
var role_privilege_Schema = mongoose.Schema({
    role_id: {
        type: String
    },
    privilege_ref: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'privileges',
    	default:new ObjectId()
    }
});
var roles_privilege = mongoose.model('role_privilege', role_privilege_Schema);
module.exports = roles_privilege;