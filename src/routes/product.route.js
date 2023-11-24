const express = require('express');
const productController = require('./../controllers/product.controller')
const {body} = require('express-validator');

const authenticateJWT = require ('../middlewares/authenticateJWT')
const allowedTo = require ('../middlewares/allowedTo')

const router = express.Router();

router.use(authenticateJWT);

router
.route('/statistic')
.get(allowedTo(['admin']),productController.getStatistic)
router
  .route('/')
  .get(productController.getProducts)
  .post(
  [
    body('name').notEmpty(),
    body('price').notEmpty().isNumeric(),
    body('image').notEmpty(),
    body('images').optional().isArray(),
    body('description').notEmpty()
  ],
    productController.postProducts
  );

  router
  .route('/:id')
  .get(productController.getProductbyid)
  .patch(
    productController.uploadImages,
    productController.resizeImages,
    [
      body('name').notEmpty(),
      body('price').notEmpty().isNumeric(),
      body('image').notEmpty(),
      body('images').optional().isArray(),
      body('description').notEmpty()
    ],
    productController.updateProductbyid
    )
  .delete(productController.deleteProductbyid);

// router
// .route('/')
// .get(productController.getProducts)
// .post(productController.postProducts);

module.exports = router;