const express = require('express');
const {body, query} = require('express-validator');

const userController = require('./../controllers/user.controller')
const authenticateJWT = require ('../middlewares/authenticateJWT')

const router = express.Router();
router.use(authenticateJWT);

router  
    .route('/near')
    .get(
        [
            query('distance').notEmpty().isNumeric(),
            query('lng').notEmpty().isNumeric(),
            query('lat').notEmpty().isNumeric(),
        ],
        userController.getNearUsers
    )

router  
    .route('/:id/address')
    .patch(
        [
            body('lng').notEmpty().isNumeric(),
            body('lat').notEmpty().isNumeric(),
            body('description').notEmpty(),        
        ],
        userController.updateAddress,
    )

router
    .route('/me')
    .patch(
        userController.uploatPhoto,
        userController.resizePhoto,
        [
            body('email').isEmail(),
            body('name').optional()
        ],
    userController.updateMe,
)

module.exports = router;