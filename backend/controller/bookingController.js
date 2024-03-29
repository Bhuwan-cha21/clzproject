const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// console.log(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const Booking = require('../models/bookingModel')
const factory = require('./handelfactory')
const axios = require('axios');
exports.bookingsofuser  =  async (req, res) => {
 
    try {
      const userId = req.params.id
      
      const bookings = await Booking.find({ user: userId })
      .populate('user', '-__v -passwordChangedAt')
      .populate('tour', 'name')
      if (bookings.length === 0) {
        return res.status(404).json({ message: 'User has no bookings' });
      }
  
      res.json({ bookings });
    } catch (error) {
      console.log(err)
    }
  };
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    /* 
    1) Get the currently booked tour
    2) create checkout session
    3) create session as response
    */
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`tour/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    res.status(200).json({
        status: 'success',
        session
    })
})

exports.createBookingCheckout = catchAsync(async(req, res, next) => {
    const { tour, user, price } = req.query;
    if(!tour && !user && !price) return next();
    await Booking.create({ tour, user, price })

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking =  catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.body;
  
  try{
    const existingBooking = await Booking.findOne({ tour, user });
    if( existingBooking){
        res.json('')
    }
    else{
      const doc = await Booking.create(req.body);
      
      res.status(201).json({
          status: 'success',
          data: {
              doc
          }
      })
      console.log(doc)
    }
  }catch(err){
     res.send(err)
  }
})
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);