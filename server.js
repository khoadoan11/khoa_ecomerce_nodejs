const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app')

mongoose
    .connect(process.env.DATABASE)
    .then(()=> console.log('connect data successful!'))

const port = process.env.port;

app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}`);
});