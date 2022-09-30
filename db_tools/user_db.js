require('dotenv').config({path:__dirname+"/.env"})
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')

const db_url = process.env.USER_DB_URL
console.log(db_url)
mongoose.connect(db_url)

var db = mongoose.connection

db.on('error', console.error.bind(console, "connection error:"))

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true},
  displayName:{type: String, default: null, trim: true, maxlength: 20},
  password: {type: String, required: true},
  email: {type: String, required: true},
  verifiedAccount: {type: Boolean, default: false},
  dateCreated: {type: Date, default: Date.now},
})

var userAccount = mongoose.model('users', UserSchema, 'users')

exports.createNewUser = async function(user){
  // check if username OR email already exists, if so dont let them enter

  const userCheck = await userAccount.findOne({username:user.username})
  const emailCheck = await userAccount.findOne({email:user.email})
  if(userCheck || emailCheck) return [409, "Username or Email already exists."]


  const result = await new userAccount(user)
  if(!result) return [500, "Error creating account please try again."]

  const res = await result.save()

  if(res) return [200, "Successfully created new account!"]
  return [500, "Error creating account please try again."]
}

exports.getUser = async function(user){
  const result = await userAccount.findOne({username:user.username})
  if(result) return result
  else return null
}
