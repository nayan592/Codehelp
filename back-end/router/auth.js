const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const cookieParser = require('cookie-parser');

require('../db/conn');
const User = require('../model/userSchema');
const  mongoose  = require('mongoose');

router.get('/',(req,res)=>{
    res.send(`Hare krishna from router.js`);
});

// collecting data using promises
/*router.post('/register',(req,res)=> {
    const {name, email, phone, Password, cPassword, cc, cf, lc} = req.body;
    
    // if any field is not filled
    if(!name || !email || !phone || !Password || !cPassword || !cc || !cf || !lc){
        return res.status(422).json({error: "please fill all the fields properly"});
    }

    // If user already register with the same email or user exist already
    User.findOne({email: email})
    .then((userExist) => {
        if(userExist){
            return res.status(422).json({error: "Email Already exist"});
        }

        const user = new User({name, email, phone, Password, cPassword, cc, cf, lc})

        user.save().then(()=>{
            res.status(201).json({message:"user registered successfully"});
        }).catch((err)=>res.status(500).json({error:"Failed to register"}));
    }).catch(err =>{console.log(err);})

});*/

router.use(cookieParser());


// collecting data using await async or register
router.post('/register', async (req,res)=> {
    const {name, email, phone, Password, cPassword} = req.body;
    
    // if any field is not filled
    if(!name || !email || !phone || !Password || !cPassword){
        return res.status(422).json({error: "please fill all the fields properly"});
    }
    // fill atleast one profile link
    /*if(!cc&&!cf&&!lc){
        return res.status(422).json({error: "please fill atleast one profile link"}); 
    }*/
    if(Password !=cPassword){
        return res.status(422).json({error: "Confirm password not match to the actual password"});
    }

    try{
        const userExist = await User.findOne({email: email})
            if(userExist){
                return res.status(422).json({error: "Email Already exist"});
            }
            const user = new User({name, email, phone, Password, cPassword})
            // Here we are hashing our password before saving it
            
            await user.save();
            res.status(201).json({message:"user registered successfully"});

    }catch(err){
        console.log(err);
    }

});

// Login route
router.post('/signin', async(req,res)=>{
    try{
        let token;
        const{email,Password} = req.body;
        if(!email || !Password){
            return res.status(400).json({error:"Please fill all the fields"});
        }

        const userLogin = await User.findOne({email: email});

        if(userLogin){
            const isMatch = await bcrypt.compare(Password, userLogin.Password);

            token = await userLogin.generateAuthToken();
            console.log(token);

            res.cookie("jwtoken",token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            })

        if(!isMatch){
            res.status(400).json({error:"Invalid credentials pass"});
        }
        else{
            res.status(201).json({error:"user login successfully"});
        }
        }
        else{
            res.status(400).json({error:"Invalid credentials email"});
        }

    }catch(err){
        console.log(err);
    }
})


// about or profile page

router.get('/about', authenticate,(req,res)=>{
    res.send(req.rootUser);
});


//Totaluser lists
const PostModel = mongoose.model('user', { name: String, email: String, phone: Number });
router.get('/totaluser', function (req, res){
        
        PostModel.find({}).exec((error,user)=>{
            res.status(200).send(user); 
        });
})




module.exports = router;