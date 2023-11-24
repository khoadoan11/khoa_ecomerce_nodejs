const express = require('express');
const reviewController = require('./../controllers/review.controller')

const {body} = require('express-validator');
const authenticateJWT = require ('../middlewares/authenticateJWT')

const router = express.Router()

router.use(authenticateJWT);

router
    .route('/')
    .get(reviewController.getReview)
    .post([
        body('description').notEmpty(),
        body('rating').notEmpty(),
        body('product').isMongoId()
    ],
    reviewController.createReview,
)
module.exports = router;