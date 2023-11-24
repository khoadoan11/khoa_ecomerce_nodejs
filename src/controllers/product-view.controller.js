const Product = require('../models/product.model');
const AppError = require('../helpers/AppError');
const catching = require('../helpers/catching');

exports.getProducts = catching ( async (req, res, next) =>{
    const query = Product
        .find()
        .select ('id name price description')
        .sort('price');

    const products = await query;

    res
        .status (200)
        .render('product-list', {
            products,
        });
});

exports.getProduct = catching ( async (req, res, next) =>{
    const {id} = req.params;
    const product = await Product.findById(id);

    if(!product){
        next (new AppError('not found!', 404))
    }

    res
        .status (200)
        .render('product-detail', {
            product,
        });
});