const express=require('express');
const bcrypt=require('bcrypt');
const {UserModel}=require('../model/user.model');
const Redis = require('ioredis');
const jwt=require('jsonwebtoken');
// const bodyParser = require('body-parser');
// const exp = require('constants');
// const redisClient = new Redis();
const redis = new Redis({
    port : "13881",
    host : "redis-13881.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    password : "iuIcoRFsH3WwAlScP2KkuBM9CpNGhKTu"
});


const userRouter=express.Router();

userRouter.post('/register',(req,res)=>{
    const {name,email,pass}=req.body;
    try{
        bcrypt.hash(pass,3,async(err,hash)=>{
          if(err){
            res.status(200).json({err});
          }else{
            const user=new UserModel({name,email,pass:hash});
            await user.save();
            res.status(200).json({msg:"new user has been register",user})
          }
        })
    }
    catch(err){
        res.status(400).json({err});
    }
})

userRouter.post("/login", async (req, res) => {
    const { email, pass } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (user) {
        bcrypt.compare(pass, user.pass, (err, result) => {
          if (result) {
            const token = jwt.sign({ course: "nsd104" }, "masai",{expiresIn:100});
            
            redis.set(token, "Anjali", 'EX', 120);
            console.log(token);
  
            res.status(200).json({
              msg: "login done",
              token: token,
            });
          } else {
            res.status(200).json({ msg: "wrong password" });
          }
        });
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err });
    }
  });




//logout
userRouter.get("/logout", async (req, res) => {
    try {
     const token=req.headers.authorization?.split(" ")[1];
     blacklistToken(token);
      res.status(200).json({ msg: "LOGGED OUT" });
    } catch (err) {
      res.status(400).json({ error: "err" });
      console.log(err);
    }
  });

  //blacklist token
function blacklistToken(token) {
    redis.set(token, 'blacklisted', 'EX', 1000);
}


module.exports={
    userRouter,
}