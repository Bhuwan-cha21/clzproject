const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const User = require('../models/userModel');

const userController = require('../controller/userController')
const authController = require('../controller/authController')

//signup and login routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/getuserfromtoken', async (req,res) =>{
    try{
        const decoded = jwt.decode(req.body.token)
       const dataToSend =  await User.findById(decoded.id)
       res.send(dataToSend)
    }catch(err){
        console.log(err)
    }
});

//forgot password and reset password routes
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//protect all routes after this middleware
// router.use(authController.protect);

router.patch('/updateMyPassword/:id', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.uploadUserPhoto,userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//restricted all routes after this middleware for admin only
// router.use(authController.restrictTo('admin'))
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;