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
                pass: 'aqswde123'
            }
        })
    }
    async send(){
       
      

        let mailDetails = {
            from: this.from,
            to: this.to,
            subject: 'Test mail',
            text: 'Your account has been registered in our Himalaya travel and tours'
        };

       await this.newTransport().sendMail(mailDetails)
       
    }
    async sendWelcome(){
        await this.send()
    }
}
