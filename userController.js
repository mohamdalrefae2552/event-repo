const User  = require('../models/userModels');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');


 //const mailer = require('../helpers/mailer');

 const jwt = require('jsonwebtoken');
const userRegister = async(req,res) => {

    try{

      const errors =  validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
            success:false,
            msg:  'Errors',
            errors: errors.array()
        
        });
      }
        const {name, email, mobile, password} = req.body;


const isExists = await User.findOne({email});

if(isExists){
    return res.status(400).json({
        success:false,
        msg:  'email Already Exists!'
    
    });
}
       const hashPassword = await  bcrypt.hash(password,10);
  
       const user =  new User(
            {
                name,
                email,
                mobile,
                password:hashPassword,
                image:'images/'+req.file.filename
            }
         );

           const userData = await user.save();
            

        // const msg = '<p> Hii  '+name+', Pleas <a href="http://127.0.0.1:3000/mail-verification?id='+userData._id+'">Verify </a> your mail. </p> ';
           
        const accessToken = await generateAccessToken({ user: userData });
      
           return res.status(200).json({
            success:true,
            msg: 'Registered successfuly!',
            user:userData,
            accessToken: accessToken,
             tokenType: 'Bearer'
        });
    }catch(error){
        return res.status(400).json({
            success:false,
            msg:error.message
        });
    }
}
const generateAccessToken = (user) => {
    const secretOrPrivateKey = process.env.ACCESS_TOKEN_SECRE || 'your_secret_key';
    return jwt.sign(user, secretOrPrivateKey, { expiresIn: '2h' });
  }
  
  
// const  generateAccessToken = async(user) => {

//     jwt.sign(user,process.env.ACCESS_TOKEN_SECRE,{expiresIn:'2h'});
//     return token;
// }

const loginUser = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          msg: 'Errors',
          errors: errors.array()
        });
      }
      const { email, password } = req.body;
      const userData = await User.findOne({ email });
      if (!userData) {
        return res.status(400).json({
          success: false,
          msg: 'Email and Password is Incorrect...!',
        });
      }
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          msg: 'Email and Password is Incorrect!',
        });
      }
      if (!userData.is_verified == 0) {
        return res.status(401).json({
          success: false,
          msg: 'Please Verify your Account!',
        });
      }
      const accessToken = await generateAccessToken({ user: userData });
      return res.status(200).json({
        success: true,
        msg: 'Login successfully!',
        user: userData,
        accessToken: accessToken,
        tokenType: 'Bearer'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        msg: error.message
      });
    }
  };

 module.exports = {
    userRegister,
    loginUser
 }