const AppError = require('../helpers/AppError');

const allowedTo = (roles) =>{
    return (req, res, next) =>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('do not have perssion!', 403));
        }
        next();
    }
}

module.exports = allowedTo;