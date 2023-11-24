const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
app.use(express.json());

app.use(morgan('dev'));
app.get('/', (req, res) =>{
    res.status(200).json({
        message: 'hello world'
    });
});

// post(new), get, put(update: thay the hoan toan), patch(update: cap nhat tung phan), delete
// c (craete): /products (post)
// r ( read ) : /products (get) || /products/2 (get)
// u (update): /products/2 (patch)
// d ( delete): /products/2 (delete)


app.get('/products', (req, res) =>{ //query
    //console.log(req.query);
    const {name} = req.query;
    fs.readFile(`${__dirname}/src/data/product-list.json`, 'utf-8',(error,data)=>{
        if(error){
            console.log(error);
            return;
            
        }
        //console.log(name);

        const products = JSON.parse(data);
        let filteredList = products;

        if(name){
            filteredList = products.filter(
                item => item.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        res
            .status(200)
            .json({
                status: 'success',
                data: {
                    products: filteredList,
                }
            })
    });
});

app.post('/products', (req, res) =>{
    fs.readFile(`${__dirname}/src/data/product-list.json`, 'utf-8',(error,data)=>{
        if(error){
            console.log(error);
            return;
    }
    const{
        name,
        price,
        image,
        description,
    } = req.body;

    const products = JSON.parse(data);
    const nextId = products[products.length - 1].id + 1;
    const product = {
      id: nextId,
      name,
      price,
      image,
      description,
    }

    products.push(product);
    fs.writeFile(
    `${__dirname}/src/data/product-list.json`,
    JSON.stringify(products),
        () => {
          res
            .status(201)
            .json({
              status: 'success',
              data: {
                product,
              }
          });
        }
      )
    });
});

app.get('/products/:id', (req, res) => {
    fs.readFile(`${__dirname}/src/data/product-list.json`, 'utf-8', (error, data) => {
      if (error) {
        console.log(error);
        return;
      }
  
      const id = Number(req.params.id);
      const products = JSON.parse(data);
      const product = products.find(item => item.id === id);
  
      if (product) {
        res
        .status(200)
        .json({
          status: 'success',
          data: {
            product,
          }
        });
      } else {
        res
          .status(404)
          .json({
            status: 'fail',
            message: 'Not Found!!!'
          })
      }
    });
  });

  app.patch('/products/:id', (req, res) => {
    fs.readFile(`${__dirname}/src/data/product-list.json`, 'utf-8', (error, data) => {
      if (error) {
        console.log(error);
        return;
      }
  
      const id = Number(req.params.id);
      const {
        name,
        price,
        image,
        description
      } = req.body;
  
      const products = JSON.parse(data);
      const product = products.find(item => item.id === id);
  
      if (product) {
        product.name = name || product.name; 
        product.price = price || product.price;
        product.image = image || product.image;
        product.description = description || product.description;

        fs.writeFile(`${__dirname}/src/data/product-list.json`, JSON.stringify(products), () =>{
          res
          .status(200)
          .json({
            status: 'success',
            data: {
              product,
            }
          });
        })
      } else {
        res
          .status(404)
          .json({
            status: 'fail',
            message: 'Not Found!!!'
          })
      }
    });
  });

  app.delete('/products/:id', (req, res) => {
    fs.readFile(`${__dirname}/src/data/product-list.json`, 'utf-8',(error,data)=>{
      if(error){
          console.log(error);
          return;
        }
        const id = Number(req.params.id);  
        const products = JSON.parse(data);
        const deletedIndex = products.findIndex(item => item.id === id);

        if(deletedIndex !== -1){
          products.splice(deletedIndex,1);
        
        
        fs.writeFile(`${__dirname}/src/data/product-list.json`, JSON.stringify(products), 
          () =>{
            res
            .status(204)
            .json({
              status: 'success',
              data: {
               product: null
              }
            })
        });
    }else {
      res
        .status(404)
        .json({
          status: 'fail',
          message: 'Not Found!!!'
        });
    }
  });
});
const port = 3000;
app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}`);
});
console.log(__dirname);

    
