const express = require('express')
const tourController = require('../controller/tourController')
const authController = require('../controller/authController')
const Tour = require('../models/tourModel');
const router = express.Router();


//param middleware
// router.param('id', tourController.checkId)

router.post('/addedby', async (req, res) => {
        
        try {
          const users = await Tour.find({ addedBy: req.body.id });
          res.json({ status: 'success',users});
          console.log(users)
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server Error' });
        }
});

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.postTour)
//     authController.protect, authController.restrictTo('admin','lead-guide'),

router.route('/get-stats').get(tourController.getTourStats);
router.route('/search').get(tourController.searchTour)
router.route('/monthly-plan/:year').get(authController.protect, 
            authController.restrictTo('admin','lead-guide','guide'),
            tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
        .get(tourController.getToursWithin)

router.route('/distances/center/:latlng/unit/:unit').get(tourController.getDistances)




module.exports = router;