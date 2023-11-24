const jwt = require('jsonwebtoken');

const AppError = require('../helpers/AppError');
const User = require('../models/user.model');
const catching = require('../helpers/catching');

const authenticateJWT = catching(async (req, res, next) =>{
    let token;
    if(req.headers.authorrization && req.headers.authorrization.startsWith('Bearer')){
        token = req.headers.authorrization.split(' ')[1];
    }else if (req.cookies.token){
        token = req.cookies.token;
    }else{
        return next(new AppError('do not have Permission!', 401));
    }
    const decoded = await new Promise((resolve, reject) =>{
        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (error, data) =>{
                if(error){
                    reject('token is not valid')
                } else{
                    resolve(data);
                }
            }
        );
    });
    const user = await User.findById(decoded.id);
    if(user === null){
        return next(new AppError('do not have Permission!', 401));
    }
    req.user = user;
    next();
});

module.exports = authenticateJWT;