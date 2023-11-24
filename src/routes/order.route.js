const express = require('express');

const orderController = require('./../controllers/order.controller')
const authenticateJWT = require ('../middlewares/authenticateJWT')

const router = express.Router();

router.use(authenticateJWT);

router  
  .route('/payment')
  .post(orderController.makePayment);

  module.exports = router;