const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Review = require('../models/review.model');
const AppError = require('../helpers/AppError');
const catching = require('../helpers/catching');
const Product = require('../models/product.model');

exports.getReview = catching( async (req, res) =>{
    const {productId} = req.query;
    const queryOject = {};

    if(productId){
        queryOject.product = productId;
    }

    const query = Review
        .find(queryOject)
        .populate([
            {
            path: 'product', 
            select: 'name price'
            },
            {
            path: 'user', 
            select: 'email role'
            },
        ])
        .sort('createAt');
    const reviews = await query;
    res 
        .status(200)
        .json({
            status:'success',
            data:{
                reviews
            },
        }) 
    });

exports.createReview = catching(async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      next(new AppError('data is not valid', 422, errors.array()));
      return;
    }

    const{
        description,
        rating,
        product,
    } = req.body;

    const review = await Review.create({
        description,
        rating,
        product,
        user: req.user._id
    })

    const stats = await Review.aggregate([
        {
            $match: { product: new mongoose.Types.ObjectId(product)}
        },
        {
            $group:{
                _id: null,
                ratingQuantity: { $sum: 1},
                ratingAverage: {$avg: '$rating'}
            }
        }
    ]);

    if(stats.length > 0){
        await Product.findByIdAndUpdate(
            product, 
            {
                ratingQuantity: stats[0].ratingQuantity,
                ratingAverage: stats[0].ratingAverage
            }
        )
    }
    res
    .status(201)
    .json({
        status: 'success',
        data:{
            review,
        }
    })
})