const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

// GET all purchases
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .sort({ date: -1 })
      .populate('productId', 'name code');
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create purchase
router.post('/', async (req, res) => {
  try {
    const { productId, supplier, quantity, price, notes } = req.body;
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Create purchase
    const purchase = new Purchase({
      productId,
      supplier,
      quantity,
      price,
      total: quantity * price,
      notes
    });
    
    // Increase product stock
    product.stock += quantity;
    await product.save();
    await purchase.save();
    
    res.status(201).json(purchase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
