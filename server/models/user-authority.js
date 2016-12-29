/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var mongoose = require('mongoose');
var Authority = mongoose.Schema({
  email: {
	  type:String
  },
  role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roles'
  }
});
var Authority = mongoose.model('Authority', Authority);
module.exports = Authority;