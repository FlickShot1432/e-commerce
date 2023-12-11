const express = require('express');
const router = express.Router();
const { database } = require('../config/helpers')


/* GET All Products. */
router.get('/', function (req, res) {       // Sending Page Query Parameter is mandatory http://localhost:3636/api/products?page=1
  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   // set limit of items per page
  let startValue;
  let endValue;
  if (page > 0) {
      startValue = (page * limit) - limit;     // 0, 10, 20, 30
      endValue = page * limit;                  // 10, 20, 30, 40
  } else {
      startValue = 0;
      endValue = 10;
  }
  database.table('products as p')
      .join([
          {
              table: "categories as c",
              on: `c.id = p.cat_id`
          }
      ])
      .withFields(['c.title as category',
          'p.title as name',
          'p.price',
          'p.quantity',
          'p.description',
          'p.image',
          'p.id'
      ])
      .slice(startValue, endValue)
      .sort({id: .1})
      .getAll()
      .then(prods => {
          if (prods.length > 0) {
              res.status(200).json({
                  count: prods.length,
                  products: prods
              });
          } else {
              res.json({message: "No products found"});
          }
      })
      .catch(err => console.log(err));
});


/* GET Single Product. */
router.get('/:prodId',(req,res)=>{
  
  let productId = req.params.prodId
  console.log(productId);
  database.table('products as p')
  .join([
    {
      table: "categories as c",
      on: `c.id = p.cat_id`
    }
  ])
  .withFields(['c.title as category',
    'p.title as name',
    'p.price',
    'p.quantity',
    'p.description',
    'p.image',
    'p.images',
    'p.id'
  ])

  .filter({'p.id' : productId})
  .get()
  .then(prod => {
    if (prod) {
      res.status(200).json(prod);
    } else {
      res.json({ message:  `No product found with id ${productId}` });
    }
  }).catch(err => console.log(err));

});



/* GET All Products from one Category. */
router.get('/category/:catName',(req,res)=>{
  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1; //set the Current Page Number
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 1; //Set the limit of items per page

  let startValue;
  let endValue;

  if (page > 0) {
    startValue = (page * limit) - limit;
    endValue = page * limit
  } else {
    startValue = 0
    endValue = 10
  }


   //Fetch the Category name from the url 
  const cat_title = req.params.catName;

  database.table('products as p')
    .join([
      {
        table: "categories as c",
        on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}%'`
      }
    ])
    .withFields(['c.title as category',
      'p.title as name',
      'p.price',
      'p.quantity',
      'p.description',
      'p.image',
      'p.id'
    ])
    .slice(startValue, endValue)
    .sort({ id: .1 })
    .getAll()
    .then(prods => {
      if (prods.length > 0) {
        res.status(200).json({
          count: prods.length,
          products: prods
        });
      } else {
        res.json({  message:  `No products found from Category  ${cat_title} category.` });
      }
    }).catch(err => console.log(err));

})

//Delete the Product
router.delete("/delete/:prodId", (req, res) => {
  let prodId = req.params.prodId;

  if (!isNaN(prodId)) {
    database
      .table("products")
      .filter({ id: prodId })
      .remove()
        .then(successNum => {
            if (successNum == 1) {
                res.status(200).json({
                    message: `Record deleted with product id ${prodId}`,
                    status: 'success'
                });
            } else {
                res.status(500).json({status: 'failure', message: 'Cannot delete the product'});
          }
      })
      .catch((err) => res.status(500).json(err));
  } else {
    res
      .status(500)
      .json({ message: "ID is not a valid number", status: "failure" });
  }
});
 



module.exports = router;
