const express = require ('express');
const {body} = require('express-validator');

const router = express.Router();
const authController = require('./../controllers/auth.controller');
const User = require('../models/user.model');

router.post(
    '/signup',
    [
        body('email').isEmail().custom(
            async (value) =>{
                const user = await User.findOne({email: value})
                if(user){
                throw new Error('email already has!')
                }
                return true;
            }
        ),
        body('password').isLength({min: 6}),
        body('confirmPassword').custom(
            (value, {req}) =>{
                if( value === req.body.password) {
                    return true;
                }
                throw new Error('confirm password has not matches')
            }
        )
    ],
    authController.signup
);

router.post(
    '/login',
    [
        body('email').isEmail(),
        body('password').isLength({min:6}),
    ],
    authController.login,
)

module.exports = router