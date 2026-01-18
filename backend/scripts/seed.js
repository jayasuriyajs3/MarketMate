require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const run = async () => {
  await connectDB();

  try {
    console.log('Seeding database...');

    // Clear existing sample data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Ensure an admin exists
    let admin = await User.findOne({ role: 'admin', email: 'admin@marketmate.com' });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'admin@marketmate.com',
        password: 'admin123',
        role: 'admin',
        isApproved: true,
      });
      console.log('Created admin user admin@marketmate.com / admin123');
    } else {
      console.log('Admin already exists');
    }

    // Create 2 approved shopkeepers
    const shopsData = [
      {
        username: 'freshmart', email: 'freshmart@example.com', password: 'password123', role: 'shopkeeper',
        isApproved: true, shopName: 'FreshMart Superstore', phoneNumber: '9876543210', address: '12 Market Road, City Center'
      },
      {
        username: 'greenbasket', email: 'greenbasket@example.com', password: 'password123', role: 'shopkeeper',
        isApproved: true, shopName: 'Green Basket Organics', phoneNumber: '9876501234', address: '5 Park Lane, North Block'
      }
    ];

    const shopkeepers = [];
    for (const s of shopsData) {
      let u = await User.findOne({ email: s.email });
      if (!u) {
        u = await User.create(s);
        console.log('Created shopkeeper:', s.shopName);
      }
      shopkeepers.push(u);
    }

    // Local SVG images by category (guaranteed to load)
    const categoryImages = {
      'Groceries': '/images/groceries.svg',
      'Vegetables': '/images/vegetables.svg',
      'Fruits': '/images/fruits.svg',
      'Dairy': '/images/dairy.svg',
      'Bakery': '/images/bakery.svg',
      'Beverages': '/images/beverages.svg',
      'Snacks': '/images/snacks.svg',
      'Other': '/images/other.svg'
    };
    const img = (category) => categoryImages[category] || '/images/other.svg';

    // 2+ products per category with variety
    const products = [
      // Groceries (3 products)
      { productName: 'Basmati Rice Premium 5kg', category: 'Groceries', price: 650, discount: 10, stock: 40, unit: 'packet', description: 'Premium long-grain aromatic rice, perfect for biryani.', imageUrl: img('Groceries'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },
      { productName: 'Sunflower Oil 1L', category: 'Groceries', price: 180, discount: 5, stock: 60, unit: 'liter', description: 'Refined, light and healthy cooking oil.', imageUrl: img('Groceries'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
      { productName: 'Wheat Flour 5kg', category: 'Groceries', price: 320, discount: 0, stock: 50, unit: 'packet', description: 'Premium whole wheat flour for rotis and breads.', imageUrl: img('Groceries'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },

      // Vegetables (3 products)
      { productName: 'Fresh Tomatoes 1kg', category: 'Vegetables', price: 40, discount: 0, stock: 100, unit: 'kg', description: 'Bright red and juicy tomatoes, farm fresh.', imageUrl: img('Vegetables'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },
      { productName: 'Potatoes 5kg', category: 'Vegetables', price: 150, discount: 0, stock: 120, unit: 'kg', description: 'Clean and firm potatoes, best for cooking.', imageUrl: img('Vegetables'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
      { productName: 'Onions 2kg', category: 'Vegetables', price: 60, discount: 10, stock: 80, unit: 'kg', description: 'Fresh yellow onions with strong flavor.', imageUrl: img('Vegetables'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },

      // Fruits (3 products)
      { productName: 'Bananas 1 Dozen', category: 'Fruits', price: 60, discount: 15, stock: 80, unit: 'dozen', description: 'Sweet ripe bananas, rich in potassium.', imageUrl: img('Fruits'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },
      { productName: 'Apples Kashmir 1kg', category: 'Fruits', price: 180, discount: 8, stock: 70, unit: 'kg', description: 'Crisp Kashmir apples, fresh and sweet.', imageUrl: img('Fruits'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
      { productName: 'Oranges 1kg', category: 'Fruits', price: 80, discount: 5, stock: 60, unit: 'kg', description: 'Juicy oranges loaded with vitamin C.', imageUrl: img('Fruits'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },

      // Dairy (3 products)
      { productName: 'Toned Milk 1L', category: 'Dairy', price: 52, discount: 0, stock: 100, unit: 'liter', description: 'Fresh toned milk, delivered daily.', imageUrl: img('Dairy'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },
      { productName: 'Curd 500g', category: 'Dairy', price: 45, discount: 0, stock: 90, unit: 'packet', description: 'Thick and creamy homemade style curd.', imageUrl: img('Dairy'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
      { productName: 'Ghee 500ml', category: 'Dairy', price: 450, discount: 12, stock: 30, unit: 'packet', description: 'Pure desi ghee, made from cow milk.', imageUrl: img('Dairy'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },

      // Bakery (3 products)
      { productName: 'Whole Wheat Bread', category: 'Bakery', price: 45, discount: 0, stock: 50, unit: 'packet', description: 'Freshly baked whole wheat bread daily.', imageUrl: img('Bakery'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },
      { productName: 'Chocolate Muffins (6)', category: 'Bakery', price: 150, discount: 12, stock: 30, unit: 'packet', description: 'Soft and rich chocolate muffins.', imageUrl: img('Bakery'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
      { productName: 'Croissants (4 pcs)', category: 'Bakery', price: 120, discount: 8, stock: 25, unit: 'packet', description: 'Buttery French croissants, perfect breakfast.', imageUrl: img('Bakery'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },

      // Beverages (3 products)
      { productName: 'Orange Juice 1L', category: 'Beverages', price: 120, discount: 5, stock: 40, unit: 'liter', description: '100% pure orange juice, no added sugar.', imageUrl: img('Beverages'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },
      { productName: 'Green Tea (100 bags)', category: 'Beverages', price: 220, discount: 0, stock: 35, unit: 'packet', description: 'Refreshing green tea for healthy living.', imageUrl: img('Beverages'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
      { productName: 'Coffee Powder 250g', category: 'Beverages', price: 280, discount: 10, stock: 45, unit: 'packet', description: 'Premium coffee powder, rich aroma.', imageUrl: img('Beverages'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },

      // Snacks (3 products)
      { productName: 'Potato Chips Family Pack', category: 'Snacks', price: 95, discount: 10, stock: 80, unit: 'packet', description: 'Crispy classic salted potato chips.', imageUrl: img('Snacks'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },
      { productName: 'Dark Chocolate 70%', category: 'Snacks', price: 120, discount: 15, stock: 25, unit: 'piece', description: 'Rich cocoa dark chocolate, premium quality.', imageUrl: img('Snacks'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
      { productName: 'Almonds 250g', category: 'Snacks', price: 380, discount: 0, stock: 20, unit: 'packet', description: 'Premium roasted almonds, protein rich.', imageUrl: img('Snacks'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },

      // Other (3 products)
      { productName: 'Honey 500ml', category: 'Other', price: 320, discount: 8, stock: 35, unit: 'packet', description: 'Pure natural honey, no additives.', imageUrl: img('Other'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
      { productName: 'Salt 1kg', category: 'Other', price: 25, discount: 0, stock: 200, unit: 'packet', description: 'Pure iodized salt for cooking.', imageUrl: img('Other'), shopName: shopkeepers[0].shopName, shopkeeper: shopkeepers[0]._id },
      { productName: 'Spice Mix 100g', category: 'Other', price: 80, discount: 5, stock: 50, unit: 'packet', description: 'Traditional masala blend for curries.', imageUrl: img('Other'), shopName: shopkeepers[1].shopName, shopkeeper: shopkeepers[1]._id },
    ];

    await Product.insertMany(products);
    console.log(`Inserted ${products.length} products across all categories.`);

    console.log('Seeding complete!');
    console.log('\nAdmin Login: admin@marketmate.com / admin123');
    console.log('Shopkeeper 1: freshmart@example.com / password123');
    console.log('Shopkeeper 2: greenbasket@example.com / password123');
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
