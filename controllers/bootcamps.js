const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const path = require('path')


//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps =asyncHandler( async (req,res,next) =>{
        res
        .status(200)
        .json(res.advancedResults)

});

//@desc     Get single bootcamps
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp =asyncHandler( async (req,res,next) =>{

        const bootcamp = await Bootcamp.findById(req.params.id)
        if(!bootcamp){
           return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`,404));
        }
        res.status(200).json({success:true,data:bootcamp})

});

//@desc     Create single bootcamps
//@route    POST /api/v1/bootcamps/
//@access   Private
exports.createBootcamps =asyncHandler( async (req,res,next) =>{
        // Add user to req,body
        req.body.user = req.user.id;
        // Check for published bootcamp
        const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
         // If the user is not an admin, they can only add one bootcamp
        if (publishedBootcamp && req.user.role !== 'admin') {
                return next(
                        new ErrorResponse(
                                `The user with ID ${req.user.id} has already published a bootcamp`,
                                400
                        )
                );
        }
        const bootcamp = await Bootcamp.create(req.body)
        res.status(201).json({
            success:true,
            data:bootcamp
        })
 
});

//@desc     Update single bootcamps
//@route    PUT /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamps =asyncHandler( async (req,res,next) =>{

        let bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
         return next(new ErrorResponse(`Error while updating bootcamp issue with id passed in ${req.params.id}`,404));
        }

        // Make sure user is bootcamp owner
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(
                        new ErrorResponse(
                                `User ${req.user.id} is not authorized to update this bootcamp`,
                                401
                        )
                );
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
        });

        res.status(200).json({success:true,data:bootcamp})

});

//@desc     Delete single bootcamps
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamps =asyncHandler( async (req,res,next) =>{

        // findByIdAndRemove with not trigger the middleware in bootcamp model 'remove'-middleware
        const bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
                return next(
                        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
                );
        }

        // Make sure user is bootcamp owner
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(
                        new ErrorResponse(
                                `User ${req.user.id} is not authorized to delete this bootcamp`,
                                401
                )
        );
        }

        // remove with trigger the middleware in bootcamp model 'remove'-middleware
        bootcamp.deleteOne();

        res.status(200).json({success:true,data:{}})

});

//@desc     get bootcamp within radius according to zip code 
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Private
exports.getBootcampsInRadius =asyncHandler( async (req,res,next) =>{

        const {zipcode , distance} = req.params;

        //get lat/lon from geocoder

        const loc = await geocoder.geocode(zipcode)
        const lat = loc[0].latitude
        const lng = loc[0].longitude

        // calc radius 
        // divide distasnce by raduis of earth
        // earth radius = 3,963 mi 

        const raduis = distance / 3963

        const bootcamps = await Bootcamp.find({
                location: { $geoWithin : { $centerSphere: [ [lng,lat] , raduis] } }
        })
       
        res.status(200).json({
                success:true,
                count:bootcamps.length,
                data:bootcamps
        })
});


//@desc     Upload photo for bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   Private
exports.bootcampPhotoUpload =asyncHandler( async (req,res,next) =>{

   const bootcamp = await Bootcamp.findById(req.params.id)

   if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id : ${req.params.id}`,404));
    }

      // Make sure user is bootcamp owner
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(
                        new ErrorResponse(
                                `User ${req.user.id} is not authorized to update this bootcamp`,
                                401
                        )
                );
        }

    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`,404))
    }

    const file = req.files.file

    // Make sure image is a photo
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an image file`,404))
    }

    //check file size
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload image file lass than ${process.env.MAX_FILE_UPLOAD}`,404))
    }

    //Create custom file name 
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    
    //move file to folder 
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
          console.error(err)
          return next(new ErrorResponse(`Error while file upload`,500))  
        }
        await Bootcamp.findByIdAndUpdate(req.params.id,{photo : file.name})
        res.status(200).json({success:true , data:file.name})
    })

});