const express = require('express')

const {
    getBootcamps,
    getBootcamp,
    createBootcamps,
    updateBootcamps,
    deleteBootcamps,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps')

//bootcamp model 
const Bootcamp = require('../models/Bootcamp')

//advanced Result middle ware
const advancedResults = require('../middleware/advancedResults')

//include other resource routers
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router();

// Auth Middleware 
const {protect , authorize} = require('../middleware/auth')


//re route into other resource reouters
router.use('/:bootcampId/courses' , courseRouter)
router.use('/:bootcampId/reviews' , reviewRouter)

router
.route('/radius/:zipcode/:distance')
.get(getBootcampsInRadius)


router
.route('/:id/photo')
.put(protect , authorize('publisher' , 'admin'),bootcampPhotoUpload)


router
.route('/')
.get(advancedResults(Bootcamp,'courses'),getBootcamps)
.post(protect, authorize('publisher' , 'admin') ,createBootcamps);


router
.route('/:id')
.get(getBootcamp)
.put(protect , authorize('publisher' , 'admin')  ,updateBootcamps)
.delete(protect , authorize('publisher' , 'admin')  ,deleteBootcamps);


module.exports = router;