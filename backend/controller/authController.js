const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
var jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
var bcrypt = require('bcryptjs');
const Email = require('./../utils/email');
const crypto = require('crypto');


//function generating jwt token
const signToken = id => {
    return jwt.sign({id : id}, 'secret', {
        expiresIn: '1h'
    });
}

const createSendToken = async (user, statusCode,req, res) => {
    const token = signToken(user._id)
    user.password = undefined;
    res.cookie('jwt', token, 20000);
    res.status(statusCode).json({
        status: 'success',
        token,
        id : user._id,
        data: {
            user: user
        }
    })
}

//signup middleware using jwt
exports.signup = async(req, res, next) => {
    
     
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role : req.body.role,
            addedBy : req.body.addedBy
        });
        const user = await newUser.save()

        createSendToken(user, 200, req, res);
        await new Email(user).sendWelcome();
    }catch(err){
        if (err.code === 11000 && err.keyPattern.email) {
            // Handle the duplicate email error
            res.json({
                status:"409",
                message:"User exists,Please choose another email"
            })
          } else {
            // Handle other errors
            console.error(err);
          }
    }

    
}

//login middleware using jwt
exports.login = catchAsync(async(req, res, next) => {
    // const email = req.body.email;
    // const password = req.body.password;
    // console.log("this is executing")
    const {email, password} = req.body
    //check if email and password exist

    if(!email || !password){
        return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOne({email: email}).select('+password');
    if(!user){
            res.send({message:"Enter Correct email"})
    }
    //check if password is correct
    if(user){
        const isMatched = await bcrypt.compare(password, user.password);
        if(isMatched){
            createSendToken(user, 200, req, res);
        }
        else{
            res.send({message:"Enter Correct Password"})
        }
    }
})

//middleware to check if user is logged in 
exports.protect = catchAsync(async(req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    
    if(!token){
        return next(new AppError('You are not logged in', 401));
    }
    // 2) Verification token
    const decoded = await jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);
    if(!user){
        return next(new AppError('User does not exist', 401));
    }
    // 4) Check if user changed password after the token was issued

    if(user.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again', 401));
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = user;
    next();
})

//restrictions middleware only for mentioned roles
exports.restrictTo = (...roles) => {
    /*returining the middleware function bcoz middleware doesnot work on arguments
    roles contain array new es6 feature
    getting role value from req.user previous middleware which runs before this middleware
    */
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}

//forgot password controller
exports.forgotPassword = catchAsync(async(req, res, next) => {
    /* 
    1. Get user based on posted email
    2. Generate the random reset token
    3. Set the reset token expiration
    4. Save the reset token to user
    5. Send the email to user's email with the reset token
    */
   const user = await User.findOne({email: req.body.email});
   if(!user){
       return next(new AppError('There is no user with this email address', 404));
   }
    //generate the token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});/*validateBeforeSave: false 
    is used to save the token without validation.. this will deactivate all required field in user model*/

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    // const message = `Forgot your password send patch request with password and conform password in ${resetURL}\n if this is not you ignore this email`;
    try{
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your password reset token (valid for 10 min)',
        //     message
        // });
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: `Token sent to ${user.email}`
        })
    }
    catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError('There was an error sending the email. Try again later', 500));
    }
})

exports.resetPassword = catchAsync(async(req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });
    if(!user){
        return next(new AppError('Token is invalid or Expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res, req);
})

//updating password functionality for logged in user
exports.updatePassword = catchAsync(async(req, res, next) => {
    /*
    1. Get user from collection
    2. Check if posted password is correct
    3. Update password
    4. Save the user
    */
    const user = await User.findById(req.user.id).select('+password');
    const isMatched = await bcrypt.compare(req.body.oldPassword, user.password);
    if(!isMatched){
        return next(new AppError('Incorrect password', 400));
    }
    
    if(user.password === req.body.newPassword){
        return next(new AppError('New password should be different from old password', 400));
    }
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    // user.passwordChangedAt = Date.now() - 1000;
    await user.save();
  
    createSendToken(newUser, 200, res, req);
    // const token = signToken(user._id)
    // res.status(200).json({
    //     status: 'success',
    //     message: 'Password updated successfully',
    //     token
    // })
})