const crypto = require('crypto');
const mongoose = require('mongoose')
var bcrypt = require('bcryptjs');
const validator = require('validator')
const { Schema } = mongoose;

//name, email, photo, password, passwordConfirm

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        trim: true,
        maxlength: [100, 'Name must be less or equal then 100 characters'],
        minlength: [2, 'Name must be more or equal then 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: [true, 'Email is already taken'],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: {
        type: String,
        enum: ["user", "guide", "admin","system-admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

//pre middleware to hash password before saving
userSchema.pre('save', async function(next){
    //only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //hash password
    console.log(this.password)
    this.password = await bcrypt.hash(this.password, 12);

    //delete passwordConfirm
    this.passwordConfirm = undefined;
    next();
})



const User = mongoose.model('User', userSchema);

module.exports = User;