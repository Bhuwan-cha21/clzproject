const express = require('express')
const tourController = require('../controller/tourController')
const authController = require('../controller/authController')
const router = express.Router();


//param middleware
// router.param('id', tourController.checkId)



router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.postTour)
//     authController.protect, authController.restrictTo('admin','lead-guide'),

router.route('/get-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, 
            authController.restrictTo('admin','lead-guide','guide'),
            tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
        .get(tourController.getToursWithin)

router.route('/distances/center/:latlng/unit/:unit').get(tourController.getDistances)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo('admin','lead-guide'),tourController.updateTourImages,
            tourController.resizeTourImages,tourController.updateTour)
    .delete(authController.protect, 
            authController.restrictTo('admin','lead-guide'), 
            tourController.deleteTour)

module.exports = router;