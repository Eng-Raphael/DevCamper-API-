const express = require('express')

const {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');
const { route } = require('./bootcamps');

//advanced result middleware 
const advancedResults = require('../middleware/advancedResults')

//get course model
const Course = require('../models/Course')

const router = express.Router({mergeParams : true});

const {protect , authorize} = require('../middleware/auth')

router
.route('/')
.get(advancedResults(Course,{
    path:'bootcamp',
    select:'name description'
}),getCourses)
.post(protect ,authorize('publisher' , 'admin') ,addCourse)


router
.route('/:id')
.get(getCourse)
.put(protect , authorize('publisher' , 'admin'),updateCourse)
.delete(protect , authorize('publisher' , 'admin'),deleteCourse)

module.exports = router;
