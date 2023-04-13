const express = require('express');
const router = express.Router();

const bookingController = require('../controller/bookingController');
const authController = require('../controller/authController');



router
    .post('/checkout-session/:tourId', 
    bookingController.getCheckoutSession);


router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking)

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking)

module.exports = router;