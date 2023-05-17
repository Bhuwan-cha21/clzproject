const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Email = require('./../utils/email');

const bookingSchema = new Schema({
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a tour']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a user']
  },
  price: {
    type: Number,
    required: [true, 'A booking must have a price']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre('save', async function (next) {
  const booking = this;
  try {
    const populatedBooking = await booking.constructor.populate(booking, {
      path: 'tour',
      model: 'Tour'
    });
    await populatedBooking.constructor.populate(populatedBooking, {
      path: 'user',
      model: 'User'
    });

    const tour = populatedBooking.tour;
    const user = populatedBooking.user;

    await new Email(user).sendbooktour(tour.name, tour.startDates[0]);
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
