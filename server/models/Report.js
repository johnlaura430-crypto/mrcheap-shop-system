const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true 
  },
  period: { // e.g., "2024-01", "2024-W05", "2024-01-15"
    type: String,
    required: true
  },
  totalSales: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  topProducts: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    quantity: Number,
    revenue: Number
  }],
  lowStockItems: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    currentStock: Number,
    minStock: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
