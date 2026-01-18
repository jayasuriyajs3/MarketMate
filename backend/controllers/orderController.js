const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      
      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.productName}` });
      }

      const itemTotal = product.finalPrice * item.quantity;
      orderItems.push({
        product: product._id,
        productName: product.productName,
        shopName: product.shopName,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
        finalPrice: product.finalPrice,
      });

      totalAmount += itemTotal;

      // Reduce product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
    });

    // Clear cart
    await Cart.deleteOne({ user: req.user._id });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
