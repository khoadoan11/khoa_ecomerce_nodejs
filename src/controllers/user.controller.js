const { validationResult } = require('express-validator')
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const catching = require('../helpers/catching');
const AppError = require('../helpers/AppError');
const  User = require('../models/user.model'); 

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'public/img');
    },
    filename: (req, file, cb) =>{
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${uuidv4()}.${ext}`)
    },
});

const multerFilter = (req, file, cb) =>{
    const {mimetype} = file;
    if(mimetype.startsWith('image')){
        cb(null, true);
    } else{
        cb(new AppError('Not an image', 422), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploatPhoto = upload.single('photo');

exports.resizePhoto = catching (async (req, res, next) =>{
    const {file, body} = req;

    if(!file){
        return next();
    }

    const resizeName = `resized-${file.filename}`;

    await sharp(req.file.path)
    .resize(500)
    .toFile(`public/img/${resizeName}`);

    body.photo = resizeName;

    next();
});

exports.updateMe = catching(async (req, res, next) =>{
    const errors = validationResult(req)
    if(errors.isEmpty() === false){
        return next (new AppError('Data is not valid', 422, errors.array()));
    }
    const{
        user,
        body:{
            email,
            name,
            photo
        }
    } = req;
    user.email = email || user.email;
    user.name = name || user.name;
    user.photo = photo || user.photo;

    await user.save();
    user.password = undefined;

    res
        .status(200)
        .json({
            status: 'success',
            data:{
                user,
            }
        })
});

exports.getNearUsers = catching(async(req, res, next) =>{
    const errors = validationResult(req)
    if(errors.isEmpty() === false){
        return next (new AppError('Data is not valid', 422, errors.array()));
    }

    const{
        distance,
        lng,
        lat
    } = req.query;

    const user = await User.aggregate([
        {
            $geoNear:{
                near: {
                    type: 'Point',
                    coordinates: [Number(lng), Number(lat)]
                },
                distanceField: 'distance',
                maxDistance: Number(distance),
            }
        },
        {
            $project:{
                email: 1,
                distance: 1,
            }
        },
    ]);

    res
        .status(200)
        .json({
            status: 'success',
            data:{
                user,
            }
        })
});

// /user/:id/address (patch)
exports.updateAddress = catching( async (req, res, next) =>{
    const errors = validationResult(req)
    if(errors.isEmpty() === false){
        return next (new AppError('Data is not valid', 422, errors.array()));
    }

    const {id} = req.params;
    const user = await User.findById(id);

    if(!user){
        return next(new AppError('Not Found!!', 404));
    }
    
    const{
        lng,
        lat,
        description
    } = req.body

    user.address = {
        type:'Point',
        coordinates:[lng, lat],
        description,
    }

    await user.save();
    user.password = undefined;

    res 
        .status(200)
        .json({
            status: 'success',
            data:{
                user,
            }
        })
})