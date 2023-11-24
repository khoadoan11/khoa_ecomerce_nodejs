const { validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const Product = require('../models/product.model');
const AppError = require('../helpers/AppError');
const catching = require('../helpers/catching');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) =>{
      cb(null, 'public/img');
  },
  filename: (req, file, cb) =>{
    const {id} = req.params;
    const ext = file.mimetype.split('/')[1];
    cb(null, `product-${id}-${uuidv4()}.${ext}`)
  },
});

const multerFilter = (req, file, cb) =>{
  const {mimetype} = file;
  if(mimetype.startsWith('image')){
      cb(null, true);
  } else{
      cb(new AppError('Not an image', 422), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadImages = upload.fields([
  {name: 'image', maxCount:1 },
  {name: 'images', maxCount:3 },
]);

exports.resizeImages = catching (async (req, res, next) =>{
  const {files, body} = req;

  if(!files.image && Files.images){
      return next();
  }

  if(files.image){
    const image = files.image[0];
    const resizeName = `resized-${image.filename}`;
    await sharp(image.path)
    .resize(500)
    .toFile(`public/img/${resizeName}`);
    body.image = resizeName;
  }

  if(files.images){
    const {images} = files;
    body.images = [];

    for (const image of images){
      const resizeName = `resized-${image.filename}`;  
      await sharp(image.path)
      .resize(500)
      .toFile(`public/img/${resizeName}`);

      body.images.push({url: resizeName});
    }
  }

  next();
});

exports.getProducts = catching(async (req, res, next) => { //query
    const {
      name,
      description,
      minPrice,
      maxPrice,
      //page = 1,
    } = req.query;
    const queryOjb = {};
    const topExps = [];
    const searchStringExps = [];
    const priceExps = [];
    // const limit = 3;
    // const skip = (Number(page) - 1) * limit;
    // (name or description) and (minPrice and maxPrice)
    /*
    {
      $and:[
        $or:[{ name: ...}, {descripton: ...}]
        $and :[{ minPrice: ...}, {maxPrice: ...}]
      ]
    }
    */

    if (name) {
      searchStringExps.push({ name: new RegExp(name, 'i') });
    }
    if (description) {
      searchStringExps.push({ description: new RegExp(description, 'i') });
    }
    if (minPrice) {
      priceExps.push({
        price: { $gte: minPrice }
      });
    }
    if (maxPrice) {
      priceExps.push({
        price: { $lte: maxPrice }
      });
    }

    if (searchStringExps.length > 0) {
      topExps.push({
        $or: searchStringExps
      });
    }
    if (priceExps.length > 0) {
      topExps.push({
        $and: priceExps
      });
    }

    if (topExps.length > 0) {
      queryOjb.$and = topExps;
    }

    console.log(JSON.stringify(queryOjb));
    const query = Product
      .find(queryOjb)
      .select('name price description ratingQuantity ratingAverage')
      .sort('-price')
      // .skip(skip)
      // .limit(limit);


    // const query = Product.find({ //i: ignore
    //   $or: [{name: new RegExp(name, 'i')}, {description: new RegExp(description, 'i')}]
    // });
    const products = await query;
    res
      .status(200)
      .json({
        status: 'success',
        data: {
          products
        }
      });

})

exports.postProducts = catching(async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      next(new AppError('data is not valid', 422, errors.array()));
      return;
    }
    const {
      name,
      price,
      image,
      images,
      description,
    } = req.body;

    const product = await Product.create({
      name,
      price,
      image,
      images,
      description,
    });

    res.status(201).json({
      status: 'success',
      data: {
        product,
      }
    });

  // const product = new Product({
  //   name,
  //   price,
  //   image,
  //   description
  // });
  // await product.save();



  // fs.readFile(`${__dirname}/../data/product-list.json`, 'utf-8',(error,data)=>{
  //     if(error){
  //         console.log(error);
  //         return;
  // }
  // const{
  //     name,
  //     price,
  //     image,
  //     description,
  // } = req.body;

  // const products = JSON.parse(data);
  // const nextId = products[products.length - 1].id + 1;
  // const product = {
  //   id: nextId,
  //   name,
  //   price,
  //   image,
  //   description,
  // }

  // products.push(product);
  // fs.writeFile(
  // `${__dirname}/../data/product-list.json`,
  // JSON.stringify(products),
  //     () => {
  //       res
  //         .status(201)
  //         .json({
  //           status: 'success',
  //           data: {
  //             product,
  //           }
  //       });
  //     }
  //   )
  // });
})

exports.getProductbyid = catching(async(req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate({
        path:'reviews',
        populate:{
          path: 'user',
          select: 'email'
        },
      })
    if (!product) {
      res
        .status(404)
        .json({
          status: 'fail',
          message: 'Not Found!!!'
        });
      return;
    }
    res
      .status(200)
      .json({
        status: 'success',
        data: {
          product,
        }
      });
})

exports.updateProductbyid = catching(async (req, res, next) => {
    const errors = validationResult(req);
    if(errors.isEmpty() === false){
      next(new AppError('Not Found!!!', 404, error.array()));
      return;
    }
    const {id} = req.params;
    const {
      name,
      price,
      image,
      images,
      description,
    } = req.body;
    const product = await Product.findById(id);
    if (!product) {
      next(new AppError('Not Found!!!', 404, error.array()));
      return;
    }
    product.name = name || product.name;
    product.price = price || product.price;
    product.image = image || product.image;
    product.images = images || product.images;
    product.description = description || product.description;
    await product.save();

    res
    .status(200)
    .json({
      status: 'success',
      data: {
        product,
      }
    });
  // fs.readFile(`${__dirname}/../data/product-list.json`, 'utf-8', (error, data) => {
  //   if (error) {
  //     console.log(error);
  //     return;
  //   }

  //   const id = Number(req.params.id);
  //   const {
  //     name,
  //     price,
  //     image,
  //     description
  //   } = req.body;

  //   const products = JSON.parse(data);
  //   const product = products.find(item => item.id === id);

  //   if (product) {
  //     product.name = name || product.name;
  //     product.price = price || product.price;
  //     product.image = image || product.image;
  //     product.description = description || product.description;

  //     fs.writeFile(`${__dirname}/../data/product-list.json`, JSON.stringify(products), () => {
  //       res
  //         .status(200)
  //         .json({
  //           status: 'success',
  //           data: {
  //             product,
  //           }
  //         });
  //     })
  //   } else {
  //     res
  //       .status(404)
  //       .json({
  //         status: 'fail',
  //         message: 'Not Found!!!'
  //       })
  //   }
  // });
})

exports.deleteProductbyid = catching(async (req, res) => {
    const {id} = req.params;
    await Product.findByIdAndDelete(id);
    
    res.status(204)
      .json({
        status: 'success',
        data: {
          product: null
      }
      })
  // fs.readFile(`${__dirname}/../data/product-list.json`, 'utf-8', (error, data) => {
  //   if (error) {
  //     console.log(error);
  //     return;
  //   }
  //   const id = Number(req.params.id);
  //   const products = JSON.parse(data);
  //   const deletedIndex = products.findIndex(item => item.id === id);

  //   if (deletedIndex !== -1) {
  //     products.splice(deletedIndex, 1);


  //     fs.writeFile(`${__dirname}/../data/product-list.json`, JSON.stringify(products),
  //       () => {
  //         res
  //           .status(204)
  //           .json({
  //             status: 'success',
  //             data: {
  //               product: null
  //             }
  //           })
  //       });
  //   } else {
  //     res
  //       .status(404)
  //       .json({
  //         status: 'fail',
  //         message: 'Not Found!!!'
  //       });
  //   }
  // });
})

exports.getStatistic = catching(async (req, res) =>{
    const statistic = await Product.aggregate([
      {
        $match: { price: {$gte:5000}}
      },
      {
        $group: {
          _id: '$madeBy',
          totalPrice: {$sum: '$price'},
          avgPrice:{$avg: '$price'},
          minPrice:{$min: '$price'},
          maxPrice:{$max: '$price'},
        }
      },
      {
      $sort: { avgPrice: -1 }
      }
    ]);

    res
    .status(200)
    .json({
      status: 'success',
      data:{
        statistic,
      }
    })
})