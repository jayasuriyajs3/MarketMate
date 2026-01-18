const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Other'],
  },
  description: {
    type: String,
    trim: true,
  },
  shopkeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shopName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: 0,
    default: 0,
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'gram', 'g', 'liter', 'L', 'ml', 'piece', 'pieces', 'packet', 'pack', 'dozen'],
    default: 'piece',
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x300?text=No+Image',
  },
  imagePublicId: {
    type: String, // Cloudinary public ID for deletion
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate final price BEFORE validation so required passes
productSchema.pre('validate', function (next) {
  const price = Number(this.price) || 0;
  const discount = Number(this.discount) || 0;
  if (discount > 0) {
    this.finalPrice = Number((price - (price * discount) / 100).toFixed(2));
  } else {
    this.finalPrice = price;
  }
  this.lastUpdated = Date.now();
  next();
});

// Index for faster queries
productSchema.index({ productName: 1, shopName: 1 });
productSchema.index({ category: 1 });
productSchema.index({ discount: -1 });

module.exports = mongoose.model('Product', productSchema);
