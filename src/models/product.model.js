const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            min: 0,
            required: true,
        },
        image: {
            type: String,
            required: true
        },
        priceStripeId:{
            type: String,
        },
        images: [
            {
                url: String,
                alt: String,
            }
        ],
        description: {
            type: String,
            required: true
        },
        madeBy: {
            type: String,
            required: true,
            default: 'VN'
        },
        ratingQuantity: {
            type: Number,
        },
        ratingAverage: {
            type: Number,
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

productSchema.pre('save', function (next) {
    if (!this.$isNew) {
        this.updatedAt = Date.now();
    }
    next();
});

productSchema.virtual('reviews', {
    ref:'Review',
    foreignField: 'product',
    localField: '_id',
});


const Product = mongoose.model('Product', productSchema)

module.exports = Product;