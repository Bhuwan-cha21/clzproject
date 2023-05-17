const nodemailer = require('nodemailer');


module.exports = class Email {
    constructor(user){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        
        this.from = `Samir ${process.env.EMAIL_FROM}`;
        console.log(user.email)
    }

    newTransport(){
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user:'tourandhotel.help@gmail.com',
                pass: 'msuncclronssxukq'
            }
        })
    }
    async send(){
       let mailDetails = {
            from: this.from,
            to: this.to,
            subject: 'Test mail',
            text: ' Welcome to the family. Your account has been registered in our  travel and tours'
        };

       await this.newTransport().sendMail(mailDetails)
       
    }
    async sendotp(otp){
        let mailDetails = {
            from:this.from,
            to: this.to,
            subject:'OTP',
            text :`You requested for password change. Your otp is ${otp}`
        }
        await this.newTransport().sendMail(mailDetails)
    }
    async sendbooktour(name,date){
        console.log(name)
        console.log(date)
        let mailDetails = {
            from:this.from,
            to: this.to,
            subject:'OTP',
            text :`Welcome to the group. Your tour to ${name} will start from ${date}. Please contact for more details
            
                Team Travel and Tour
                tourandhotel.help@gmail.com
                +9779865500000
            `
        }
        await this.newTransport().sendMail(mailDetails)
    }
    
    async sendWelcome(){
        try{
            await this.send()
        }catch(err){
            console.log(err)
        }
    }
    async sendOtp(otp){
        try{
            await this.sendotp(otp)
        }catch(err){
            console.log(err)
        }
    }
    async sendBook(otp){
        try{
            await this.sendbooktour(name,date)
        }catch(err){
            console.log(err)
        }
    }
}
