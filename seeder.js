const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

//load env variables 
dotenv.config({path:'./config/config.env'})

//load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

//connect to db
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
})

//Read the json files
const bootcamps = JSON.parse(fs.readFileSync('./_data/bootcamps.json','utf-8'))
const courses = JSON.parse(fs.readFileSync('./_data/courses.json','utf-8'))
const users = JSON.parse(fs.readFileSync('./_data/users.json','utf-8'))
const reviews = JSON.parse(fs.readFileSync('./_data/reviews.json','utf-8'))
//Import into db
const importData =async ()=>{
    try {
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await User.create(users)
        await Review.create(reviews)
        console.log('Data imported by seeders....'.green.inverse)
    } catch (error) {
        console.log(error)
    }
}

//delete data
const deletetData =async ()=>{
    try {
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data destroyed by seeders....'.red.inverse)
    } catch (error) {
        console.log(error)
    }
}

// check for seeder or delete option from process.argv
if(process.argv[2]==='-i'){
    importData()
}else if (process.argv[2]==='-d'){
    deletetData()
}

