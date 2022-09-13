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

app.use(csurf())

const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter)

app.get("/", (req, res)=>{
  console.log("home")
  res.sendStatus(200)
})

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
    res.sendStatus(result)
  }catch{
    res.sendStatus(500)
  }
})


function userSignUpValidator(req, res, next){
  if(!req.body.username || !req.body.email || !req.body.password) return res.sendStatus(400)

  next()
}


app.listen(4000)
