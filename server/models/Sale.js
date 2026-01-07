const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productCode: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
  profit: { type: Number, required: true }, // (selling - buying) * quantity
  customerName: String,
  customerPhone: String,
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'mobile', 'credit'], 
    default: 'cash' 
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
