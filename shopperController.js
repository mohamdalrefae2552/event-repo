const    Shopper= require('../models/shopperModels');
const bcrypt = require('bcrypt');
const bcrypts = require('bcryptjs');
const {validationResult} = require('express-validator');
const createToken = require('../utile/createToken');
const asyncHandler = require('express-async-handler');
 const mailer = require('../helpers/mailer');
 const ApiError = require('../utile/ApiError');
 const jwt = require('jsonwebtoken');




 const registershopper = async(req,res) => {

    try{

      const errors =  validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
            success:false,
            msg:  'Errors',
            errors: errors.array()
        
        });
      }
        const {event_name, email, mobile, password,location} = req.body;


const isExists = await Shopper.findOne({email});

if(isExists){
    return res.status(400).json({
        success:false,
        msg:  'email Already Exists!'
    
    });
}
       const hashPassword = await  bcrypt.hash(password,10);
  
       const shopper =  new Shopper (
            {
                event_name,
                email,
                mobile,
                password:hashPassword,
                image:'images/'+req.file.filename,
                location
            }
         );
             const token = createToken(shopper._id);

           const shopperData = await shopper.save();
            

        // const msg = '<p> Hii  '+name+', Pleas <a href="http://127.0.0.1:3000/mail-verification?id='+userData._id+'">Verify </a> your mail. </p> ';
           

          // mailer.sendMail(email,'Mail Verification ', msg);

           return res.status(200).json({
            success:true,
            msg: 'Registered successfuly!',
            shopper:shopperData,
            token:token
  
        });
        
    }catch(error){
        return res.status(400).json({
            success:false,
            msg:error.message
        });
    }
}

const generateAccessToken = (shopper) => {
    const secretOrPrivateKey = process.env.ACCESS_TOKEN_SECRE || 'your_secret_key';
    return jwt.sign(shopper, secretOrPrivateKey, { expiresIn: '2h' });
  }
  

const loginshopper = async(req, res) => {
    try{

const errors = validationResult(req);
if (!errors.isEmpty()) {

    return res.status(400).json({
        success:false,
        msg:'Errors',
        errors: errors.array()
    });
}
    const { email , password} = req.body;
    const shopper_Data = await Shopper.findOne({ email });
    if (!shopper_Data) {
        return res.status(400).json({
            success:false,
            msg:'Email and Password is Incorrect... !',
           
        });
    }

    const passwordMatch = await bcrypt.compare(password, shopper_Data.password)

    if (!passwordMatch) {
        return res.status(400).json({
            success:false,
            msg:'Email and Password is Incorrect !',
           
        });
    }
    if (!shopper_Data.is_verified === 0) {
        return res.status(401).json({
            success:false,
            msg:'Please Verify your Account !',
           
        });
    }

    const accessToken = await generateAccessToken({ shopper: shopper_Data });
    return res.status(200).json({
      success: true,
      msg: 'Login successfully!',
      shopper: shopper_Data,
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
    registershopper,
    loginshopper
 }