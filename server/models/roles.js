/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoose = require('mongoose');
var rolesSchema = mongoose.Schema({
  role_id: {
	  type:String, 
	  unique:true,
	  uppercase: true
  },
  name: {
	  type:String,
	  unique:true
  },
  desc: {
	  type:String
  }
});
var roleModel = mongoose.model('Roles', rolesSchema);
module.exports = roleModel;