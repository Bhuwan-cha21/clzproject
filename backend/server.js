const path = require('path');
var express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')
const compression = require('compression')
const connectDB = require('./database/database')
const tourRouter = require('./routes/tourRoute')
const bookingRouter = require('./routes/bookingRoute')
const cors = require('cors')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controller/errorController')

const userRouter = require('./routes/userRoute')


var app = express()

app.enable('trust proxy')

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
connectDB()

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Global Middlewares

//middleware helmet
app.use(helmet())
app.use(cors())
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