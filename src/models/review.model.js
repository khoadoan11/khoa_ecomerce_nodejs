const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    description:{
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        min: 1,
        max: 5,
    },
    product:{
        type: mongoose.Schema.ObjectId,
        ref:'Product',
        require: true,
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: true,
    },
    createeAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date,
    }
});

reviewSchema.pre('save', function (next){
    if(!this.$isNew){
        this.updatedAt = Date.now();
    }
    next();
});

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;