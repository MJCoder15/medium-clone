const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")
const user = require('../Model/user')
const article = require('../Controllers/article')

const route = express.Router()

route.post('/signup', async(req, res)=>{
    const {fullname, email, password}= req.body

    const hashed = await bcrypt.hash(password, 12)
    req.body.password = hashed

    const author = new user({
        fullname:req.body.fullname,
        email: req.body.email,
        password: req.body.password
    })

    await author.save();
    res.send("Author Created")

})

route.post('/login', async(req, res)=>{
  const {email, password} = req.body

  const userExist = await user.findOne({email: email})
  if(!userExist){
    return 'User not found'
  }
  
  const checkPassword = await bcrypt.compare(password, userExist.password)
  if(!checkPassword){
    return "Password incorrect"
  }

  const token = jwt.sign({id: userExist._id, date: new Date()}, process.env.SECRET, {expiresIn: '2hr'})

  res.cookie('access_token', token, {
    httpOnly:true,
    secure:false
}
).send('Yay!!! login successful')

})

const auth = async (req, res, next)=>{
  const token = req.cookies.access_token
  const verification = jwt.verify(token, process.env.SECRET)

  if(!verification){
      return res.ststus(403).send('Forbidden')
  }

  const currentUser = await user.findById(verification.id)
  req.user = currentUser

  next();
}

route.post('/follow/:id', auth, async(req, res)=>{
  const author = await user.findById({_id: req.params.id})
  const action = author.follower({
    author: req.user._id
  })
   
  res.send('You followed')
})

route.get('/users', async(req, res)=>{
  const users = await user.find()
  res.send(users)
})

route.post('/following', async(req, res)=>{
  
})



module.exports = route