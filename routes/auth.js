const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const crypto = require('crypto')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const {JWT_SECRET} =require('../config/Keys')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { SENDGRID_API,EMAIL } = require("../config/Keys");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:SENDGRID_API
    }
}))
 
router.post("/signup", (req, res) => {
    const { name, email, password, pic } = req.body;
    if (!email || !password || !name) {
        return res.status(422).json({ error: "please add all the field" });
    }

    User.findOne({ email: email }).then((savedUser) => {
        if (savedUser) {
            return res
                .status(422)
                .json({ error: "user already exists with that email" });
        }

        bcrypt
            .hash(password, 12)
            .then((hashedpassword) => {
                const user = new User({
                    email,
                    password:hashedpassword,
                    name,
                    pic
                });
                user
                    .save()
                    .then((user) => {
                        transporter.sendMail({
                            to:user.email,
                            from:"eslam.mo.hussein@gmail.com",
                            subject:"Signup success",
                            html:"<h1>Welcome to React Instagram</h1> <br/> <p>We are waiting you for Post. <br> to login in <a href='https://react-instagram.herokuapp.com/login'>Cilck here</a></p>"
                        })
                        res.json({ message: "saved successfully" });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    });
});

router.post("/sigin", (req, res) => {
    const {email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "please add all the field" });
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return  res.status(422).json({ error: "Invalid Email or password" });
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                // res.json({message:"Successfully sigin in"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email,followers,following,pic} = savedUser
                res.json({token,user:{_id,name,email,followers,following,pic}})
            }else{
                return  res.status(422).json({ error: "Invalid Email or password" });
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
});

router.post('/reset-password',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"User don't exists with that email"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then((result)=>{
                transporter.sendMail({
                    to:user.email,
                    from:"eslam.mo.hussein@gmail.com",
                    subject:"password reset",
                    html:`<p>You requested for password reset</p>
                    <h5>click in this <a href="${EMAIL}/reset/${token}">Link</a> to reset password</h5>`
                })
            })
            res.json({message:"Check your email"})
        })
    })
})

router.post('/new-password',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,12).then(hashedpassword=>{
            user.password = hashedpassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save().then((saveduser)=>{
                res.json({message:"password updtated success"})
            })
        })
    }).catch(err=>{
        console.log(err)
    })
})
module.exports = router;