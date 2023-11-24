const mongoose = require ('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Order = require('../models/order.model');
const Product = require('../models/product.model');
const catching = require('../helpers/catching');

exports.makePayment = catching(async (req, res, next) =>{
  const {
    products
  } = req.body;

  const order = await Order.create({
    status:'pending',
    products,
    user: req.user._id,
  });

  const productIds = products.map(item => new mongoose.Types.ObjectId(item.product));
  const productsDB = await Product.find({_id: {$in: productIds}});

  const stripeItems = [];
  for(const item of productsDB){
    if(!item.priceStripeID){
      const product = await stripe.products.create({
        name:item.name,
        metadata: {
          productId: item._id.toString(),
        }
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: item.price * 100,
        currency: 'usd'
      });
      item.priceStripeId = price.id;
      await item.save();
    }

    stripeItems.push({
      price: item.priceStripeId,
      quantity: products.find(el => el.product === item._id.toString()).quantity
    });
  }

  const session = await stripe.checkout.sessions.create({
    line_items: stripeItems,
    mode:'payment',
    client_reference_id: order._id.toString(),
    success_url: `http://localhost:3001/orders/${order._id}/success`,
    cancel_url: `http://localhost:3001/orders/${order._id}/cancel`,
  })

  res 
    .status(200)
    .json({
      sessionUrl: session.url
    });
})