const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  displayName:{type: String, default: null, trim: true, maxlength: 20},
  password: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  verifiedAccount: {type: Boolean, default: false},
  dateCreated: {type: Date, default: Date.now},
})

module.exports = mongoose.model('users', UserSchema, 'users')
