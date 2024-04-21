const Admin  = require('../models/adminModels');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');


 //const mailer = require('../helpers/mailer');


 const jwt = require('jsonwebtoken');

 const generateAccessToken = (admin) => {
    const secretOrPrivateKey = process.env.ACCESS_TOKEN_SECRE || 'your_secret_key';
    return jwt.sign(admin, secretOrPrivateKey, { expiresIn: '2h' });
  }
const loginAdmin = async (req, res) => {
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
      const adminData = await Admin .findOne({ email });
      if (!adminData) {
        return res.status(400).json({
          success: false,
          msg: 'Email and Password is Incorrect...!',
        });
      }
    //   const passwordMatch = await bcrypt.compare(password, adminData.password);
    //   if (!passwordMatch) {
    //     return res.status(400).json({
    //       success: false,
    //       msg: 'Email and Password is Incorrect!',
    //     });
    //   }
     
      const accessToken = await generateAccessToken({ admin: adminData });
      return res.status(200).json({
        success: true,
        msg: 'Login successfully!',
        admin: adminData,
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
   
    loginAdmin
 }