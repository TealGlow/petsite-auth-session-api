require('dotenv').config({path:__dirname+"/.env"})
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')
const session = require('express-session')
const userAccount = require('./models/userAccount')


exports.connectDb = ()=>{
  mongoose.connect(db_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  var db = mongoose.connection

  db.on('error', console.error.bind(console, "connection error:"))
}

const db_url = process.env.USER_DB_URL

this.connectDb()


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
