const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')

const productRouter = require ('./src/routes/product.route');
const authRouter = require('./src/routes/auth.route')
const reviewRouter = require ('./src/routes/review.route');
const userRouter = require('./src/routes/user.route');
const orderRouter = require('./src/routes/order.route')
const productViewRouter = require('./src/routes/product-view.route')
const AppError = require('./src/helpers/AppError');

const app = express();

app.use(express.static(`${__dirname}/public`));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(express.json()); //chuyeen type tu body -> object
app.use(mongoSanitize());
app.use(xss());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
app.get('/', (req, res) =>{
    res.status(200).json({
        message: 'hello world'
    });
});

app.use('/products', productViewRouter)

app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);

app.all('*', (req, res, next) =>{
    next(new AppError('url not found!', 404));
    
});

app.use((error, req, res, next) =>{
    if(!error.status){
        console.log(error);
    }
    res 
        .status(error.statusCode || 500)
        .json ({
            status:error.status || 'error',
            message: error.message,
            error: error.error,
    });
})

module.exports = app;
