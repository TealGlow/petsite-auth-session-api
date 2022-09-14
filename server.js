require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt')
const db = require("./db_tools/user_db")
const cors = require('cors')
const session = require('express-session')
const helmet = require('helmet') // protect against xss attacks in HTTP headers
const hpp = require('hpp') // protext against HTTP parameter pollution attack
const csurf = require('csurf') // protexts against cross-site request forgery
const rateLimiter = require('express-rate-limit')

const app = express()

app.use(express.json())

app.use(cors({
  origin:"http://localhost:3000"
}))

/*security configs*/
app.use(helmet())
app.use(hpp())

// session config
app.use(session({
  secret: process.env.SESSIONS_SECRET,
  saveUninitialized: true,
  resave: false,
  cookie:{
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE)
  }
}))

app.use((req, res, next)=>{
  console.log(req.session),
  next()
})

//app.use(csurf())

const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter)



app.post("/signup", userSignUpValidator, async (req, res)=>{
  // create a new user


  try{
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = {
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email
    }

    // create a session and give that cookie to the user

    const result = await db.createNewUser(user)
    if(result == 200){
      // create cookie and session
      const userInfo = {
        username: req.body.username,
        displayName: req.body.displayName,
        email: req.body.email
      }
        req.session.user = userInfo;
        res.json({
          message:"Successfully created account",
          userInfo
        })
    }else res.sendStatus(result)
  }catch{
    res.sendStatus(500)
  }
})



// login
app.post('/login', async (req, res)=>{
  // authenticate user
  // find if user exists
  //const user = users.find(user=> user.name === req.body.name)
  const user = await db.getUser(req.body)
  if(user == null){
    return res.status(400).send('Cannot find user')
  }

  try{
    if(await bcrypt.compare(req.body.password, user.password)){
      // user can log
      const userInfo = {
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }

      req.session.user = userInfo;

      res.json({
        message:"Authentication successful!",
        userInfo
      })
    }else{
      // wrong password
      res.send("not allowed")
    }
  }catch{
    res.status(500).send()
  }
})



function userSignUpValidator(req, res, next){
  if(!req.body.username || !req.body.email || !req.body.password) return res.sendStatus(400)
  next()
}


function requireAuth (req, res, next){
  const { user } = req.session;
  if(!user) return res.sendStatus(403)
  next()
}

app.listen(4000)
