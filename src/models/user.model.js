const validator = require ('validator');
const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        require: true,
        unique: true,
        validate: validator.isEmail
    },
    name: String,
    photo: String,
    role:{
        type: String,
        enum:['user', 'mod', 'admin'],
        default:'user'
    },
    address:{
        type: {
            type: String,
            emun: ['Point'],
            default:'point',
            required: true
        },
        coordinates: [Number],
        description: String,
    },
    password:{
        type: String,
        require: true,
        select: false
    },
    createeAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date,
    }
});

userSchema.index({ address: '2dsphere'});

userSchema.pre('save', function (next){
    if(!this.$isNew){
        this.updatedAt = Date.now();
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;