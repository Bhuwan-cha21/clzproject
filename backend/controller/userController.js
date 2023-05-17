const multer  = require('multer')
const sharp = require('sharp');

const User = require('./../models/userModel');
const Token = require('./../models/tokens');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handelfactory');
const Email = require('./../utils/email');
var bcrypt = require('bcryptjs');

//don't save to disk original file save after resizing
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//       }
// })
exports.saveotp = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
  
    try {
      const generateRandomNumber = () => {
        var randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        return randomNumber.toString();
      };
  
      const otp = generateRandomNumber();
  
      const tokenforuser = await Token.findOne({ email });
  
      if (!tokenforuser) {
        const newToken = new Token({
          email: email,
          tokens: [{ token: otp }]
        });
        await newToken.save();
      } else {
        tokenforuser.tokens.push({ token: otp });
        await tokenforuser.save();
      }
      await new Email(user).sendOtp(otp);
      res.send({ message: 'Token saved successfully', status : 201 });
      
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Unable to save token' });
    }
  };
  
exports.checkOtp = async (req,res,next) =>{
    const { email, token } = req.body;
    console.log(token)

  try {
    const userToken = await Token.findOne({ email, 'tokens.token': token });

    if (!userToken) {
      return res.send({ message: 'Token not found, Please enter correct one' , status: 404});
    }

    res.send({ message: 'Token is valid' , status : 200});
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Unable to check token' });
  }
}

exports.changePassword  = async(req,res,next) =>{
    const {email,  newPassword} = req.body;
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
        const user = await User.findOneAndUpdate({ email },{password : hashedPassword});
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
          }
        user.save()
        res.send({ message: 'Reset password link sent successfully',status :200 });
    }catch(err){
        console.error(err);
        res.status(500).send({ message: 'Unable to reset password' });
    }
}
exports.deleteTour = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User)










exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async(req, res) => {
//     const users = await User.find();
//     res.status(200).json({
//         status: 'success',
//         users
//     });
// });

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async(req, res, next) => {
    /*
    1) Create error if user POSTs password data
    2) Update user document with new data
    3) Send response
    */
   if(req.body.password || req.body.passwordConfirm){
       return next(new AppError('This route is not for password update', 400));
   }

   //filter out unwanted fields that are not allowed to be updated
//    const filteredBody = filterObj(req.body, 'name', 'email');
   console.log(req.file);
//    console.log(filteredBody);
   const updateObj = {
        name: req.body.name
        
   }
   if(req.file) updateObj.photo = req.file.filename
   const updatedUser = await User.findByIdAndUpdate(req.user.id, updateObj, {
         new: true,
         runValidators: true
   })
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async(req, res, next) => {
    /*
    1) Delete user document
    2) Send response
    */
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
        status: 'success',
        data: null
    })
});
   

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {

}
exports.getUserFromToken = () =>{
    console.log('bhuwan')
}
exports.getAddedBy = factory.getAddedBy(User)
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
