const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken')

const catching = require('../helpers/catching');
const AppError = require('../helpers/AppError');
const  User = require('../models/user.model'); 
const sendEmail = require('../helpers/sendEmail')

exports.signup = catching(async (req, res, next) =>{
    const errors = validationResult(req)
    if(errors.isEmpty() === false){
        return next (new AppError('Data is not valid', 422, errors.array()));
    }

    const{
        email,
        password,
    } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
        email, 
        password: hashedPassword,
    })
    user.password = undefined;

    await sendEmail({
        email,
        subject:'welcome to system!',
        html:`<h1> ${email} </h1>`
    })

    res 
        .status(201)
        .json({
            status : 'success',
            data:{
                user
            }
        })
    });

exports.login = catching(async (req, res,next) => {
    const errors = validationResult(req)
    if(errors.isEmpty() === false){
        return next (new AppError('Data is not valid', 422, errors.array()));
    }

    const {
        email, 
        password
    } = req.body;

    const user = await User.findOne({ email }).select('+ password');
    if(!user){
        return next(new AppError('data is not valid', 401));
    }

    const isCOnrrectPassword = await bcrypt.compare(password, user.password);
    if(!isCOnrrectPassword){
        return next(new AppError('data is not valid', 401));
    }

    //1: data
    //2: secret token
    //3: thoi han
    const token = jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES
        }
    )

    res
        .cookie(
            'token',
            token,
            {
                exprires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true,
                //secure:true,
            }
        )
        .status(200)
        .json({
            status: 'success',
            data:{
                token,
            }
        });
});