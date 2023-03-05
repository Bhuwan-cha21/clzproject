const moongoose =  require('mongoose')

async function connectDB() {
     try{
         moongoose.connect('mongodb://0.0.0.0:27017/tourbooking')
         console.log('successful')
     }catch(err){
         console.log(err)
     }
}
module.exports = connectDB