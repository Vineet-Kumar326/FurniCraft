/*const express = require('express');
const router = express.Router();
const { getallproducts, getproductById } = require('../controllers/productscontroller.js');
const { create } = require('../models/usermodel');
const { createproducts } = require('../controllers/productscontroller');

router.post('/products', createproducts); // Route to create a new product
router.get('/products', getallproducts ); // Route to get all products
router.get('/products/:id', getproductById ); // Route to get a specific product by ID (if needed)


module.exports = router;
*/

const express = require('express');
const router = express.Router();
const { createproduct, getallproducts, getproductById, updateproduct, deleteproduct } = require('../controllers/productscontroller');

router.post('/products',createproduct);
router.get('/products/',getallproducts);
router.get('/products/:id',getproductById);
router.put('/products',updateproduct);
router.delete('/products/:id',deleteproduct)
module.exports = router;