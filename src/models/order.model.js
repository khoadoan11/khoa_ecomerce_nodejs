const mongoose = require ('mongoose');

const orderSchema = new mongoose.Schema({
  status:{
    type: String,
    enum: ['pending', 'success', 'fail'],
    required: true,
  },
  products:[
    {
      product:{
        type: mongoose.Schema.ObjectId,
        ref:'Product'
      },
      quantity:{
        type: Number,
        min:1,
        max:10,
        validate:{
          validator: Number.isInteger
        }
      }
    }
  ],
  user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require:true,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
      type: Date,
  }
})

orderSchema.pre('save', function (next) {
  if (!this.$isNew) {
      this.updatedAt = Date.now();
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;