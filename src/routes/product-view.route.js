const express = require ('express');
const productViewController = require('./../controllers/product-view.controller');

const router = express.Router();

router  
    .route ('/')
    .get(productViewController.getProducts);

router  
    .route ('/:id')
    .get(productViewController.getProduct);

module.exports = router;