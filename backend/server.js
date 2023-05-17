const path = require('path');
var express = require('express')
var app = express()
const cors = require('cors')
app.use(
  cors({
    origin: "*",
  })
)

const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')
const axios = require('axios')



const compression = require('compression')
const connectDB = require('./database/database')
const tourRouter = require('./routes/tourRoute')
const bookingRouter = require('./routes/bookingRoute')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controller/errorController')

const userRouter = require('./routes/userRoute')




app.enable('trust proxy')

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
connectDB()

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Global Middlewares

//middleware helmet
app.use(helmet())
app.use(express.json())


//middleware morgan for development
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//rate limiting middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again in 15 minutes"
})

app.use('/api',limiter);

app.use(express.json({limit: '10kb'}));

app.use(compression());

app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

app.use(mongoSanitize());

app.use(xss());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})



// const paypal = require('paypal-rest-sdk')

// paypal.configure({
//     'mode': 'sandbox', //sandbox or live
//     'client_id': 'AcEQpoFXD8nlIXYhzVAPIA9t3ZcxRZz2PIcvjRS9v5YjJUDburSpLDMg9sJy72S40DsM3RIw92MdeZ-6',
//     'client_secret': 'EElc_aO5PlnpR24Jz3qwhY-EOEHZyU6yrK2QXSGVaulGvXMRqsLzqLSvckS44elQdTvjlUsWr20YiER1'
//   });
//   app.post('/pay', (req, res) => {
   
//     const create_payment_json = {
//       "intent": "sale",
//       "payer": {
//           "payment_method": "paypal"
//       },
//       "redirect_urls": {
//           "return_url": "http://localhost:3000/success",
//           "cancel_url": "http://localhost:3000/cancel"
//       },
//       "transactions": [{
//           "item_list": {
//               "items": [{
//                   "name": "Red Sox Hat",
//                   "sku": "001",
//                   "price": "25.00",
//                   "currency": "USD",
//                   "quantity": 1
//               }]
//           },
//           "amount": {
//               "currency": "USD",
//               "total": "25.00"
//           },
//           "description": "Hat for the best team ever"
//       }]
//     };
  
//     paypal.payment.create(create_payment_json, function (error, payment) {
      
//       if (error) {
//         throw error;
//       } else {
//         for (let i = 0; i < payment.links.length; i++) {
//           if (payment.links[i].rel === 'approval_url') {
//             res.setHeader('Access-Control-Allow-Origin', 'https://www.sandbox.paypal.com');
//             res.redirect(payment.links[i].href);
//           }
//         }
//       }
//     });
//   });
  
//   app.get('/success', (req, res) => {
    
//     const payerId = req.query.PayerID;
//     const paymentId = req.query.paymentId;
  
//     const execute_payment_json = {
//       "payer_id": payerId,
//       "transactions": [{
//         "amount": {
//           "currency": "USD",
//           "total": "25.00"
//         }
//       }]
//     };
  
//     paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
//       if (error) {
//         console.log(error.response);
//         throw error;
//       } else {
//         console.log(JSON.stringify(payment));
//          res.setHeader('Access-Control-Allow-Origin', 'https://www.sandbox.paypal.com');
//         res.send('success');
//       }
//     });
//   });
  
//   app.get('/cancel', (req, res) => {
//     res.send('Cancelled');
//   });
app.post('/pay', async (req,res) =>{
  const  {return_url,website_url,amount,purchase_order_id,purchase_order_name} = req.body
  const data = {
    return_url,
    website_url,
    amount,
    purchase_order_id,
    purchase_order_name
  }
  try{
    const response = await axios.post(`https://a.khalti.com/api/v2/epayment/initiate/`, data, {
      headers: {
        Authorization: 'Key f257e742866746e1a0ec6611999d9ce2'
      }
    })
    res.json(response.data.payment_url)
  }catch(err){
      console.log(err)
  }
})
app.post('/verify', async (req,res) =>{
  const pidx = req.body.pidx;
  const paymentVerification = await axios.post(
    `https://a.khalti.com/api/v2/epayment/lookup/`,
    {
      pidx: pidx
    },
    {
      headers: {
        Authorization: 'Key f257e742866746e1a0ec6611999d9ce2'
      }
    }
  )
  console.log(paymentVerification)
  res.json({status:"success"})
})
app.use('/api/v1/users', userRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/booking', bookingRouter)
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)) //passing the error to the next middleware this skip all middleware and go to the error handler
})


app.use(globalErrorHandler)
app.listen(3000,() =>[
    console.log('Server is running')
])

module.exports = app;