// server/routes/sales.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Create sale
router.post('/', async (req, res) => {
    try {
        const { productId, quantity, price, customerName, notes } = req.body;
        
        // Find product
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        
        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }
        
        // Create sale
        const sale = new Sale({
            productId,
            productName: product.name,
            quantity,
            price,
            total: quantity * price,
            customerName,
            notes,
            profit: (price - product.buyingPrice) * quantity
        });
        
        // Reduce stock
        product.stock -= quantity;
        await product.save();
        await sale.save();
        
        res.status(201).json(sale);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get today's sales
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const sales = await Sale.find({
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });
        
        const total = sales.reduce((sum, sale) => sum + sale.total, 0);
        const count = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        res.json({ total, count, sales });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
