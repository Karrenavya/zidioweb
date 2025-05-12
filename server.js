const express = require('express');
const mongoose = require('mongoose');
const Registeruser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const cors = require('cors');
const app = express();

mongoose.connect("mongodb+srv://projectweb:projectweb@cluster0.szbi4p3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
    () => console.log('DB Connection established')
)

app.use(express.json());
app.use(cors());

//app.use(cors({origin:"*"}))

app.post('/register',async (req, res) =>{
    try{
        console.log('Register:',req.body)
        if (!req.body) {
            return res.status(400).send('Request body is missing');
        }
        const {username,email,password,confirmpassword} =req.body;
        if ( !username || !email || !password || !confirmpassword){
    
           return res.status(400).send('All fields are required');
        }
           let exist = await Registeruser.findOne({ email });
           if(exist) return res.status(400).send('User Already Exist');
        
        if(password !== confirmpassword){
            return res.status(400).send('Passwords are not matching');
            
         }
         let newUser = Registeruser({
            username,
            email,
            password,
            confirmpassword

         });
         await newUser.save();
         res.status(200).send('Registered Successfully');

    }
    catch(err){
        console.log(err);
        return res.status(500).send('Internal Server Error')
    }
})

app.post('/login', async (req, res) => {
    try{
        const {email,password} = req.body;
        let exist = await Registeruser.findOne({email});
            if(!exist) {
                return res.status(400).send('User Not Found');
            }
            if(exist.password !== password){
                return res.status(400).send('Invalid credentilas');

            }
            let payload = {
                user:{
                    id : exist.id
                }
            }
            jwt.sign(payload,'jwtSecret',{expiresIn:3600000},
                (err,token) =>{
                    if(err) throw err;
                    return res.json({token})
                })

    }

        catch(err){
            console.log(err);
            return res.status(500).send('Server Error')
            }
    })
    app.get('/myprofile',middleware,async(req, res)=>{
        try{
            let exist = await Registeruser.findById(req.user.id);
            if(!exist){
                return res.status(400).send('User not found');
            }
            res.json(exist);

        }
        catch(err){
            console.log(err);
            return res.status(500).send('Server Error')
        }
    })

app.listen(5000,()=>{
    console.log('Server running...')

})