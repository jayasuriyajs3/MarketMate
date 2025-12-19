const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products (Public - for customers)
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;
    let query = { isAvailable: true };

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by product name
    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }

    // Build sort option
    let sortOption = {};
    if (sortBy === 'price-low') {
      sortOption.finalPrice = 1;
    } else if (sortBy === 'price-high') {
      sortOption.finalPrice = -1;
    } else if (sortBy === 'discount') {
      sortOption.discount = -1;
    } else {
      sortOption.createdAt = -1;
    }

    const products = await Product.find(query)
      .populate('shopkeeper', 'shopName phoneNumber address')
      .sort(sortOption);

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get products by shopkeeper
// @route   GET /api/products/my-products
// @access  Private
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ shopkeeper: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shopkeeper', 'shopName phoneNumber address');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Compare prices for same product across shops
// @route   GET /api/products/compare/:productName
// @access  Public
const compareProductPrices = async (req, res) => {
  try {
    const productName = req.params.productName;
    const products = await Product.find({
      productName: { $regex: productName, $options: 'i' },
      isAvailable: true,
    })
      .populate('shopkeeper', 'shopName phoneNumber address')
      .sort({ finalPrice: 1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get today's offers (products with discounts)
// @route   GET /api/products/offers/today
// @access  Public
const getTodaysOffers = async (req, res) => {
  try {
    const products = await Product.find({
      discount: { $gt: 0 },
      isAvailable: true,
    })
      .populate('shopkeeper', 'shopName phoneNumber address')
      .sort({ discount: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { productName, category, description, price, discount, stock, unit, imageUrl } = req.body;

    // Validate input
    if (!productName || !category || !price || !stock || !unit) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = await Product.create({
      productName,
      category,
      description,
      price,
      discount: discount || 0,
      stock,
      unit,
      imageUrl: imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
      shopkeeper: req.user._id,
      shopName: req.user.shopName,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update product (including daily price update)
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product belongs to the shopkeeper
    if (product.shopkeeper.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Update fields
    const { productName, category, description, price, discount, stock, unit, isAvailable, imageUrl } = req.body;

    if (productName) product.productName = productName;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (stock !== undefined) product.stock = stock;
    if (unit) product.unit = unit;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (imageUrl) product.imageUrl = imageUrl;

    await product.save();

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product belongs to the shopkeeper
    if (product.shopkeeper.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete image from Cloudinary if exists
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getMyProducts,
  getProductById,
  compareProductPrices,
  getTodaysOffers,
  createProduct,
  updateProduct,
  deleteProduct,
};
