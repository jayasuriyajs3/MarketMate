# MarketMate - Complete Technical Documentation

## Project Overview
**MarketMate** is a full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed as a local price comparison platform. It enables customers to browse products from multiple local shops, compare prices, and make informed purchasing decisions while supporting neighborhood businesses.

---

## Architecture Overview

### Technology Stack

#### Backend
- **Runtime Environment**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB Atlas (Cloud NoSQL Database)
- **ODM**: Mongoose 8.0.3
- **Authentication**: JWT (JSON Web Tokens) via jsonwebtoken 9.0.2
- **Password Hashing**: bcryptjs 2.4.3
- **File Upload**: Multer 1.4.5-lts.1
- **Image Storage**: Cloudinary 1.41.0
- **CORS**: cors 2.8.5
- **Environment Variables**: dotenv 16.3.1
- **Development**: nodemon 3.1.11

#### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.1.0
- **Routing**: React Router DOM 6.28.0
- **HTTP Client**: Axios 1.6.8
- **Styling**: Tailwind CSS 4.1.18 with custom dark theme
- **Bundler**: Vite with ESBuild

---

## System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (React)                     │
│  - Single Page Application (SPA)                             │
│  - React Router for navigation                               │
│  - Context API for state management                          │
│  - Axios for API communication                               │
└─────────────────────────────────────────────────────────────┘
                             ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER (Express)                     │
│  - RESTful API endpoints                                     │
│  - JWT authentication middleware                             │
│  - Role-based access control                                 │
│  - MVC pattern (Models, Controllers, Routes)                 │
└─────────────────────────────────────────────────────────────┘
                             ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER (MongoDB)                     │
│  - MongoDB Atlas Cloud Database                              │
│  - Collections: Users, Products, Carts, Orders              │
│  - Indexed queries for performance                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Design

### MongoDB Collections & Schemas

#### 1. **User Collection**
```javascript
{
  username: String (unique, required, min 3 chars),
  email: String (unique, required, validated),
  password: String (hashed with bcrypt, required, min 6 chars),
  role: String (enum: 'user', 'shopkeeper', 'admin'),
  isApproved: Boolean (auto-false for shopkeepers),
  shopName: String (required for shopkeepers),
  phoneNumber: String (required for shopkeepers),
  address: String (required for shopkeepers),
  createdAt: Date
}
```

**Key Features:**
- Pre-save middleware hashes passwords using bcrypt
- Custom method `matchPassword()` compares passwords
- Conditional field requirements based on role
- Indexes on email and username for fast lookups

#### 2. **Product Collection**
```javascript
{
  productName: String (required),
  category: String (enum: 8 categories),
  description: String,
  shopkeeper: ObjectId (ref: User),
  shopName: String (required),
  price: Number (required, min 0),
  discount: Number (0-100),
  finalPrice: Number (auto-calculated),
  stock: Number (required, min 0),
  unit: String (enum: kg, g, L, ml, piece, etc.),
  imageUrl: String (Cloudinary URL),
  imagePublicId: String (for deletion),
  isAvailable: Boolean,
  lastUpdated: Date,
  createdAt: Date
}
```

**Key Features:**
- Pre-validate middleware calculates finalPrice: `price - (price * discount / 100)`
- Composite indexes on `{productName, shopName}`, `category`, `discount`
- References User collection via shopkeeper ObjectId

#### 3. **Cart Collection**
```javascript
{
  user: ObjectId (ref: User, required),
  items: [{
    product: ObjectId (ref: Product, required),
    quantity: Number (required, min 1),
    price: Number (snapshot at add time)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Key Features:**
- One cart per user
- Price snapshot prevents discrepancies
- Populated with product details on retrieval

#### 4. **Order Collection**
```javascript
{
  user: ObjectId (ref: User, required),
  items: [{
    product: ObjectId (ref: Product),
    productName: String,
    shopName: String,
    quantity: Number,
    price: Number,
    discount: Number,
    finalPrice: Number
  }],
  totalAmount: Number (required),
  status: String (enum: pending, confirmed, shipped, delivered, cancelled),
  shippingAddress: String,
  paymentMethod: String (default: cash_on_delivery),
  createdAt: Date,
  updatedAt: Date
}
```

**Key Features:**
- Immutable product details (snapshot at order time)
- Order lifecycle tracking via status
- Automatic stock reduction on order creation

---

## Backend Implementation

### Server Configuration (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Initialize
dotenv.config();
const app = express();

// Middleware Stack
app.use(cors());                              // Enable CORS
app.use(express.json());                       // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Database Connection
connectDB(); // MongoDB Atlas via Mongoose

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start Server
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

### Database Connection (config/db.js)

**Concept:** Connection pooling and error handling
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Terminate on connection failure
  }
};
```

**Key Concepts:**
- Async/await for asynchronous database operations
- Process exit on failure ensures no server without DB
- Connection string from environment variables (security)

---

## Authentication & Authorization System

### JWT Authentication Flow

```
┌──────────┐      1. Login         ┌──────────┐
│  Client  │ ──────────────────────> │  Server  │
└──────────┘                         └──────────┘
                                           │
                                     2. Validate
                                           │
                                     ┌─────▼─────┐
                                     │  MongoDB  │
                                     └───────────┘
                                           │
                                     3. Generate JWT
                                           │
┌──────────┐   4. Return Token     ┌──────▼───┐
│  Client  │ <────────────────────  │  Server  │
└──────────┘                        └──────────┘
     │
     │ Store in localStorage
     │
     │ 5. Subsequent Requests
     │ (Authorization: Bearer <token>)
     │
     ▼
┌──────────┐                        ┌──────────┐
│  Server  │ ───> 6. Verify Token ─>│   JWT    │
└──────────┘                        └──────────┘
     │
     │ 7. Attach req.user
     │
     ▼
┌──────────┐
│ Protected│
│  Route   │
└──────────┘
```

### Middleware Implementation

#### 1. **Authentication Middleware (authMiddleware.js)**

```javascript
const protect = async (req, res, next) => {
  let token;
  
  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    
    try {
      // Verify JWT signature and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user to request (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      next(); // Proceed to route handler
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};
```

**Concepts Used:**
- **Bearer Token**: Industry standard for JWT transmission
- **JWT Verification**: Checks signature, expiry, and tampering
- **Request Augmentation**: Attaches user object for downstream use
- **Error Handling**: Distinguishes between missing and invalid tokens

#### 2. **Role-Based Access Control (RBAC)**

```javascript
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};

const requireApprovedShopkeeper = (req, res, next) => {
  if (req.user?.role !== 'shopkeeper') {
    return res.status(403).json({ message: 'Only shopkeepers allowed' });
  }
  if (!req.user.isApproved) {
    return res.status(403).json({ message: 'Not approved yet' });
  }
  next();
};
```

**Usage Example:**
```javascript
router.post(
  '/products', 
  protect,                      // Step 1: Authenticate
  requireApprovedShopkeeper,    // Step 2: Authorize
  createProduct                 // Step 3: Execute
);
```

---

## API Endpoints Documentation

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register user/shopkeeper |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/profile` | Private | Get logged-in user profile |

**Registration Logic:**
1. Validate required fields (email, username, password)
2. For shopkeepers: validate shopName, phone, address
3. Check if user exists (email/username)
4. Hash password with bcrypt (10 salt rounds)
5. Create user (shopkeepers set isApproved=false)
6. Generate JWT token
7. Return user data + token

**Login Logic:**
1. Find user by email
2. Compare passwords using bcrypt
3. Check if shopkeeper is approved
4. Generate JWT token
5. Return user data + token

### Product Routes (`/api/products`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all products (with filters) |
| GET | `/offers/today` | Public | Get discounted products |
| GET | `/compare/:productName` | Public | Compare prices across shops |
| GET | `/:id` | Public | Get single product |
| GET | `/my/products` | Shopkeeper | Get own products |
| POST | `/` | Shopkeeper | Create new product |
| PUT | `/:id` | Shopkeeper | Update own product |
| DELETE | `/:id` | Shopkeeper | Delete own product |

**Query Parameters (GET /):**
- `category`: Filter by category (Groceries, Vegetables, etc.)
- `search`: Regex search on productName (case-insensitive)
- `sortBy`: 
  - `price-low`: Ascending final price
  - `price-high`: Descending final price
  - `discount`: Highest discount first
  - Default: Recent products first

**Product Creation Flow:**
1. Validate required fields
2. Extract shopkeeper ID from `req.user` (set by auth middleware)
3. Calculate finalPrice in pre-validate hook
4. Save to database
5. Return created product

### Cart Routes (`/api/cart`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get user's cart |
| POST | `/add` | Private | Add item to cart |
| PUT | `/update` | Private | Update item quantity |
| POST | `/remove` | Private | Remove item from cart |
| POST | `/clear` | Private | Clear entire cart |

**Add to Cart Logic:**
1. Validate product exists and has sufficient stock
2. Find or create cart for user
3. Check if product already in cart
   - If yes: Increment quantity
   - If no: Add new item
4. Populate product details
5. Return updated cart

### Order Routes (`/api/orders`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Create order from cart |
| GET | `/my-orders` | Private | Get user's order history |
| GET | `/:id` | Private | Get single order details |

**Order Creation Flow:**
1. Validate shipping address provided
2. Fetch user's cart with populated products
3. Validate cart not empty
4. For each cart item:
   - Check stock availability
   - Snapshot product details (price, discount, etc.)
   - Calculate item total
   - Reduce product stock
5. Create order document with totalAmount
6. Delete user's cart (atomic transaction)
7. Return order confirmation

### Admin Routes (`/api/admin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/login` | Public | Admin-specific login |
| GET | `/pending-shopkeepers` | Admin | Get unapproved shopkeepers |
| GET | `/shopkeepers` | Admin | Get approved shopkeepers |
| PUT | `/shopkeepers/:id/approve` | Admin | Approve shopkeeper |
| PUT | `/shopkeepers/:id/reject` | Admin | Reject shopkeeper |

**Admin Approval Workflow:**
1. Admin views pending shopkeepers
2. Reviews shop details (name, address, phone)
3. Approves/rejects via PUT request
4. Updates `isApproved` boolean
5. Shopkeeper can now login and add products

---

## Frontend Implementation

### React Architecture

#### Component Hierarchy

```
App.jsx (Router)
├── HomePage
│   ├── Header
│   └── ProductCard (multiple)
├── LoginPage
│   └── AuthLayout
├── RegisterPage
│   └── AuthLayout
├── AdminLoginPage
├── AdminDashboard (Protected)
│   └── Header
├── ProfilePage (Protected)
│   └── Header
├── AddProductPage (Protected)
│   └── Header
├── CartPage
│   ├── Header
│   └── CartContext
└── CheckoutPage
    ├── Header
    └── CartContext
```

### State Management

#### 1. **Context API - AuthContext**

```javascript
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Hydrate from localStorage
    const saved = localStorage.getItem('mm_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate token on mount
    const token = localStorage.getItem('mm_token');
    if (token) {
      getProfile() // API call
        .then(setUser)
        .catch(() => {
          // Invalid token - logout
          localStorage.removeItem('mm_token');
          localStorage.removeItem('mm_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Concepts:**
- **Global State**: User authentication state shared across components
- **Persistent State**: localStorage for session persistence
- **Token Validation**: Automatic token verification on app load
- **Custom Hook**: `useAuth()` provides clean access pattern

#### 2. **Context API - CartContext**

```javascript
export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    const token = localStorage.getItem('mm_token');
    const response = await fetch('http://localhost:5000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    
    if (response.ok) {
      const data = await response.json();
      setCart(data);
      return true;
    }
    setLoading(false);
    return false;
  };

  const getTotalItems = () => {
    return cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, getTotalItems, loading, ...
    }}>
      {children}
    </CartContext.Provider>
  );
}
```

**Features:**
- Real-time cart synchronization with backend
- Optimistic UI updates
- Helper methods (getTotalItems, getTotalPrice)
- Loading states for better UX

### Routing & Protection

#### React Router Setup

```javascript
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      
      {/* Protected Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="/add-product" element={
        <ProtectedRoute>
          <AddProductPage />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

#### Protected Route Component

```javascript
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login, save attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based redirection
  if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

**Concepts:**
- **Route Guards**: Prevent unauthorized access
- **Loading States**: Avoid flash of wrong content
- **Location State**: Redirect back after login
- **Role Verification**: Separate admin/shopkeeper/user access

---

## Key Features & Implementation

### 1. **Product Search & Filtering**

**Frontend Implementation (HomePage.jsx):**
```javascript
const [products, setProducts] = useState([]);
const [category, setCategory] = useState('All');
const [search, setSearch] = useState('');
const [sortBy, setSortBy] = useState('recent');

const fetchProducts = async () => {
  let url = 'http://localhost:5000/api/products?';
  if (category !== 'All') url += `category=${category}&`;
  if (search) url += `search=${search}&`;
  url += `sortBy=${sortBy}`;
  
  const response = await fetch(url);
  const data = await response.json();
  setProducts(data);
};

useEffect(() => {
  fetchProducts();
}, [category, sortBy]); // Re-fetch on filter change
```

**Backend Query Building:**
```javascript
const getAllProducts = async (req, res) => {
  const { category, search, sortBy } = req.query;
  let query = { isAvailable: true };

  // Filter by category
  if (category && category !== 'All') {
    query.category = category;
  }

  // Regex search (case-insensitive)
  if (search) {
    query.productName = { $regex: search, $options: 'i' };
  }

  // Dynamic sorting
  let sortOption = {};
  if (sortBy === 'price-low') sortOption.finalPrice = 1;
  else if (sortBy === 'price-high') sortOption.finalPrice = -1;
  else if (sortBy === 'discount') sortOption.discount = -1;
  else sortOption.createdAt = -1;

  const products = await Product.find(query)
    .populate('shopkeeper', 'shopName phoneNumber address')
    .sort(sortOption);

  res.json(products);
};
```

**MongoDB Concepts:**
- **Regex Queries**: Pattern matching with `$regex` operator
- **Projection**: `.populate()` fetches related user data
- **Indexing**: Indexes on category and productName speed up queries
- **Dynamic Sorting**: Different sort orders based on user choice

### 2. **Price Comparison**

**Endpoint:** `GET /api/products/compare/:productName`

```javascript
const compareProductPrices = async (req, res) => {
  const productName = req.params.productName;
  
  const products = await Product.find({
    productName: { $regex: productName, $options: 'i' },
    isAvailable: true,
  })
    .populate('shopkeeper', 'shopName phoneNumber address')
    .sort({ finalPrice: 1 }); // Cheapest first

  res.json(products);
};
```

**Use Case:**
- User searches for "Milk"
- System finds all products matching "Milk" across all shops
- Results sorted by price (lowest to highest)
- Shows which shop offers best deal

### 3. **Discount Calculation**

**Pre-Validation Middleware:**
```javascript
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
```

**Why Pre-Validate?**
- Runs before validation, ensuring finalPrice exists for `required` check
- Automatic calculation prevents manual errors
- Triggered on both create and update operations

### 4. **Admin Approval Workflow**

**Flow:**
```
Shopkeeper Registration
         ↓
    isApproved: false
         ↓
Admin Dashboard Lists Pending
         ↓
Admin Reviews & Approves
         ↓
    isApproved: true
         ↓
Shopkeeper Can Login & Add Products
```

**Admin Controller:**
```javascript
const approveShopkeeper = async (req, res) => {
  const shopkeeper = await User.findById(req.params.id);
  
  if (shopkeeper.role !== 'shopkeeper') {
    return res.status(400).json({ message: 'Not a shopkeeper' });
  }
  
  shopkeeper.isApproved = true;
  await shopkeeper.save();
  
  res.json({ message: 'Approved successfully', shopkeeper });
};
```

**Security:**
- Only admin role can access approval endpoints
- Validates user is actually a shopkeeper before approving
- Prevents privilege escalation

### 5. **Stock Management**

**Order Creation - Stock Reduction:**
```javascript
for (const item of cart.items) {
  const product = item.product;
  
  // Check stock availability
  if (product.stock < item.quantity) {
    return res.status(400).json({ 
      message: `Insufficient stock for ${product.productName}` 
    });
  }
  
  // Reduce stock
  product.stock -= item.quantity;
  await product.save();
  
  // Add to order items
  orderItems.push({ ...item, price: product.finalPrice });
}
```

**Race Condition Prevention:**
- Check stock before creating order
- Mongoose operations are atomic per document
- In production: use transactions for multi-document updates

---

## Security Implementation

### 1. **Password Security**

**Bcrypt Hashing:**
```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Skip if password unchanged
  }
  
  const salt = await bcrypt.genSalt(10); // Generate random salt
  this.password = await bcrypt.hash(this.password, salt); // Hash password
  next();
});
```

**Concepts:**
- **Salt**: Random data added to password before hashing
- **Salt Rounds (10)**: Number of iterations (2^10 = 1024)
- **One-Way Hash**: Cannot reverse to get original password
- **Rainbow Table Resistance**: Salt prevents precomputed attacks

### 2. **JWT Authentication**

**Token Generation:**
```javascript
const generateToken = (id) => {
  return jwt.sign(
    { id },                          // Payload
    process.env.JWT_SECRET,          // Secret key
    { expiresIn: '30d' }             // Expiry
  );
};
```

**Token Structure:**
```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjY3NmE4YjRhOGM5ZDNmMWQyYzQxNTY3OCIsImlhdCI6MTczNTE0ODM2MiwiZXhwIjoxNzM3NzQwMzYyfQ.
D7_yfQN3H5KXvL8z8VmHw3qYx9Kz8FvJxKz8L9Mw3qY
```

**Verification:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// Returns: { id: '676a8b4a8c9d3f1d2c415678', iat: 1735148362, exp: 1737740362 }
```

**Benefits:**
- **Stateless**: No session storage on server
- **Scalable**: Works across multiple servers
- **Self-Contained**: Contains all necessary info
- **Tamper-Proof**: Signature verification

### 3. **Environment Variables**

**.env File:**
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/marketmate
JWT_SECRET=supersecretkey_min32chars
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefgh
PORT=5000
```

**Why?**
- **Security**: Keeps secrets out of code
- **Flexibility**: Different values per environment
- **Version Control**: .env excluded from Git

### 4. **CORS Configuration**

```javascript
app.use(cors()); // Enable all origins (development)

// Production configuration:
app.use(cors({
  origin: 'https://marketmate.com',
  credentials: true,
}));
```

**Purpose:**
- Controls which domains can access API
- Prevents unauthorized cross-origin requests
- Required for browser security

---

## Advanced Concepts Used

### 1. **Mongoose Middleware (Hooks)**

**Types Used:**
- **Pre-save**: Password hashing before saving user
- **Pre-validate**: Calculate finalPrice before validation
- **Methods**: Custom instance methods like `matchPassword()`

**Example:**
```javascript
userSchema.pre('save', async function (next) {
  // 'this' refers to the document being saved
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### 2. **Mongoose Population**

**Concept:** Automatically replace ObjectId references with actual documents

**Before Population:**
```json
{
  "_id": "abc123",
  "productName": "Milk",
  "shopkeeper": "xyz789"
}
```

**After Population:**
```json
{
  "_id": "abc123",
  "productName": "Milk",
  "shopkeeper": {
    "_id": "xyz789",
    "shopName": "Green Mart",
    "phoneNumber": "123-456-7890"
  }
}
```

**Implementation:**
```javascript
await Product.find()
  .populate('shopkeeper', 'shopName phoneNumber address'); // Select specific fields
```

### 3. **React Context API**

**Why Not Redux?**
- Simpler for small/medium apps
- No external dependencies
- Built into React

**Pattern:**
```javascript
// 1. Create Context
const MyContext = createContext(defaultValue);

// 2. Provider Component
<MyContext.Provider value={data}>
  {children}
</MyContext.Provider>

// 3. Consumer Hook
const data = useContext(MyContext);
```

### 4. **React Hooks Used**

- **useState**: Component-level state
- **useEffect**: Side effects (API calls, subscriptions)
- **useContext**: Access context values
- **useNavigate**: Programmatic routing
- **useLocation**: Current route information

### 5. **Async/Await Pattern**

**Instead of:**
```javascript
fetch(url)
  .then(response => response.json())
  .then(data => setProducts(data))
  .catch(error => console.error(error));
```

**Use:**
```javascript
try {
  const response = await fetch(url);
  const data = await response.json();
  setProducts(data);
} catch (error) {
  console.error(error);
}
```

**Benefits:**
- More readable, synchronous-looking code
- Better error handling with try/catch
- Easier to debug

### 6. **MongoDB Indexing**

**Schema Definition:**
```javascript
productSchema.index({ productName: 1, shopName: 1 }); // Compound index
productSchema.index({ category: 1 });                  // Single field
productSchema.index({ discount: -1 });                 // Descending
```

**Performance Impact:**
```
Without Index: O(n) - Scan all documents
With Index: O(log n) - Binary search
```

**Example:**
- 10,000 products
- Find by category without index: ~10,000 reads
- Find by category with index: ~13 reads (log₂ 10000)

---

## API Request/Response Flow Example

### Complete Flow: Add Product to Cart

**1. Frontend Action:**
```javascript
// CartContext.jsx
const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem('mm_token');
  
  const response = await fetch('http://localhost:5000/api/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });
  
  const data = await response.json();
  setCart(data);
};
```

**2. Express Route Matching:**
```javascript
// routes/cart.js
router.post('/add', protect, addToCart);
```

**3. Authentication Middleware:**
```javascript
// middleware/authMiddleware.js
const protect = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  next();
};
```

**4. Controller Logic:**
```javascript
// controllers/cartController.js
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  
  // Stock validation
  if (product.stock < quantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }
  
  // Find/create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }
  
  // Add/update item
  const existingItem = cart.items.find(
    item => item.product.toString() === productId
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, price: product.finalPrice });
  }
  
  await cart.save();
  await cart.populate('items.product');
  
  res.json(cart);
};
```

**5. Response:**
```json
{
  "_id": "cart123",
  "user": "user456",
  "items": [
    {
      "product": {
        "_id": "prod789",
        "productName": "Milk",
        "finalPrice": 50,
        "imageUrl": "...",
        "shopName": "Green Mart"
      },
      "quantity": 2,
      "price": 50
    }
  ],
  "updatedAt": "2026-01-31T10:30:00Z"
}
```

**6. Frontend State Update:**
```javascript
setCart(data); // Updates CartContext
// All components using useCart() automatically re-render
```

---

## Data Flow Diagrams

### User Registration Flow
```
┌─────────┐
│  User   │
│ Fills   │
│  Form   │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│   RegisterPage      │
│ (React Component)   │
└────────┬────────────┘
         │ POST /api/auth/register
         │ { username, email, password, ... }
         ▼
┌─────────────────────┐
│  authController.js  │
│  registerShopkeeper │
└────────┬────────────┘
         │
         │ 1. Validate input
         │ 2. Check if exists
         │ 3. Hash password (bcrypt)
         │ 4. Create user document
         │
         ▼
┌─────────────────────┐
│   MongoDB Atlas     │
│   Users Collection  │
└────────┬────────────┘
         │
         │ User created
         │
         ▼
┌─────────────────────┐
│  Generate JWT Token │
└────────┬────────────┘
         │
         │ Return { user, token }
         ▼
┌─────────────────────┐
│   Frontend          │
│ 1. Store token      │
│ 2. Store user       │
│ 3. Update AuthCtx   │
│ 4. Redirect         │
└─────────────────────┘
```

### Product Search Flow
```
┌─────────┐
│  User   │
│ Types   │
│"Milk"   │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│   HomePage          │
│ Search Input        │
└────────┬────────────┘
         │ GET /api/products?search=milk&sortBy=price-low
         ▼
┌─────────────────────┐
│ productController   │
│  getAllProducts     │
└────────┬────────────┘
         │
         │ Build query:
         │ { productName: /milk/i, isAvailable: true }
         │
         ▼
┌─────────────────────┐
│   MongoDB           │
│ Product.find(query) │
│ .sort({finalPrice:1})│
└────────┬────────────┘
         │
         │ Returns array of products
         │
         ▼
┌─────────────────────┐
│ .populate(shopkeeper)│
└────────┬────────────┘
         │
         │ Joins User data
         │
         ▼
┌─────────────────────┐
│   Response JSON     │
└────────┬────────────┘
         │
         │ [{ productName: "Milk", shopName: "...", ... }]
         ▼
┌─────────────────────┐
│   Frontend          │
│ setProducts(data)   │
│ Renders ProductCards│
└─────────────────────┘
```

---

## Development Workflow

### Backend Development

**1. Install Dependencies:**
```bash
cd backend
npm install
```

**2. Environment Setup:**
Create `.env` with MongoDB URI, JWT secret, Cloudinary credentials

**3. Start Development Server:**
```bash
npm run dev  # Uses nodemon for auto-restart
```

**4. Seed Database:**
```bash
npm run seed  # Populates initial data
```

### Frontend Development

**1. Install Dependencies:**
```bash
cd frontend
npm install
```

**2. API Environment Setup (Local + Render):**
- `.env.development`
  ```env
  VITE_API_MODE=local
  VITE_API_URL=http://localhost:5000
  ```
- `.env.production`
  ```env
  VITE_API_MODE=render
  VITE_API_URL=https://marketmate-1.onrender.com
  ```

The frontend API config supports both facilities:
- `local` mode → calls localhost backend
- `render` mode → calls deployed Render backend
- You can also override directly by setting `VITE_API_URL`.

**3. Start Development Server:**
```bash
npm run dev  # Vite dev server on port 5173
```

**4. Build for Production:**
```bash
npm run build  # Creates optimized build in dist/
```

### Development Tools

- **Nodemon**: Auto-restarts Node.js server on file changes
- **Vite**: Fast HMR (Hot Module Replacement) for React
- **MongoDB Compass**: GUI for database inspection
- **Postman**: API testing
- **VS Code Extensions**: ESLint, Prettier, Thunder Client

---

## Key Concepts Summary

### Backend Concepts
1. **RESTful API Design**: Resource-based URLs, HTTP methods
2. **MVC Architecture**: Models (data), Controllers (logic), Routes (endpoints)
3. **JWT Authentication**: Stateless token-based auth
4. **RBAC**: Role-based access control (user/shopkeeper/admin)
5. **Password Hashing**: Bcrypt with salt
6. **Mongoose ODM**: Schema, validation, middleware, population
7. **MongoDB**: NoSQL, document-based, indexing
8. **Environment Variables**: Configuration management
9. **CORS**: Cross-origin resource sharing
10. **Error Handling**: Global error middleware

### Frontend Concepts
1. **React Components**: Functional components with hooks
2. **React Router**: Client-side routing, protected routes
3. **Context API**: Global state management
4. **Hooks**: useState, useEffect, useContext, useNavigate
5. **Async/Await**: Promise handling
6. **Fetch API**: HTTP requests
7. **LocalStorage**: Persistent client-side storage
8. **Tailwind CSS**: Utility-first styling
9. **Vite**: Modern build tool
10. **Component Composition**: Reusable UI components

### Database Concepts
1. **NoSQL**: Schema-less, flexible documents
2. **Collections**: Users, Products, Carts, Orders
3. **References**: ObjectId relationships
4. **Population**: Joining related documents
5. **Indexing**: Query performance optimization
6. **Validation**: Schema-level constraints
7. **Middleware/Hooks**: Pre/post save operations
8. **Subdocuments**: Embedded arrays (cart items, order items)

### Security Concepts
1. **Authentication**: Verifying identity (JWT)
2. **Authorization**: Permission checking (roles)
3. **Password Security**: Hashing, salting
4. **Token Storage**: LocalStorage + Authorization header
5. **CORS**: Origin restrictions
6. **Input Validation**: Server-side checks
7. **Environment Secrets**: .env file
8. **SQL Injection Prevention**: Mongoose parameterization

---

## Project File Structure Explained

```
backend/
├── config/              # Configuration files
│   ├── db.js           # MongoDB connection
│   └── cloudinary.js   # Image upload config
├── controllers/         # Business logic
│   ├── authController.js      # Login, register
│   ├── productController.js   # Product CRUD
│   ├── orderController.js     # Order processing
│   ├── cartController.js      # Cart management
│   └── adminController.js     # Admin operations
├── middleware/          # Express middleware
│   └── authMiddleware.js      # JWT verification, RBAC
├── models/              # Mongoose schemas
│   ├── User.js         # User/Shopkeeper/Admin
│   ├── Product.js      # Product listings
│   ├── Cart.js         # Shopping carts
│   └── Order.js        # Purchase orders
├── routes/              # API endpoints
│   ├── auth.js         # Auth routes
│   ├── products.js     # Product routes
│   ├── orders.js       # Order routes
│   ├── cart.js         # Cart routes
│   ├── admin.js        # Admin routes
│   └── shops.js        # Shop routes
├── scripts/
│   └── seed.js         # Database seeding
├── .env                # Environment variables
├── package.json        # Dependencies
└── server.js           # Entry point

frontend/
├── public/             # Static assets
├── src/
│   ├── api/           # API helper functions
│   │   └── auth.js    # Auth API calls
│   ├── components/    # React components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── AddProductPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Header.jsx
│   │   ├── AuthContext.jsx     # Auth state
│   │   ├── CartContext.jsx     # Cart state
│   │   ├── ProtectedRoute.jsx  # Route guard
│   │   └── AuthLayout.jsx      # Layout wrapper
│   ├── App.jsx        # Router setup
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── vite.config.js     # Vite configuration
└── package.json       # Dependencies
```

---

## Performance Optimizations

### Backend
1. **MongoDB Indexing**: Fast category/search queries
2. **Select Projections**: Exclude unnecessary fields (e.g., password)
3. **Pagination Ready**: Limit/skip for large datasets
4. **Connection Pooling**: Mongoose default pool

### Frontend
1. **Vite Build**: ESBuild for fast bundling
2. **Code Splitting**: React.lazy for route-based splits
3. **Memoization Ready**: Can add useMemo/useCallback
4. **Image Optimization**: Cloudinary transforms

---

## Testing Approach

### Backend Testing
- Unit tests for controllers (Jest)
- Integration tests for API endpoints (Supertest)
- Database mocking (mongodb-memory-server)

### Frontend Testing
- Component tests (React Testing Library)
- Integration tests (Cypress)
- E2E user flows

---

## Deployment Considerations

### Backend
- **Hosting**: Render, Railway, Heroku, DigitalOcean
- **Database**: MongoDB Atlas (already cloud-based)
- **Environment**: NODE_ENV=production
- **Process Manager**: PM2 for production

### Frontend
- **Hosting**: Vercel, Netlify, AWS S3 + CloudFront
- **Build**: `npm run build` → dist/
- **API URL**: Update to production backend URL
- **CDN**: Cloudinary for images

---

## Future Enhancements

1. **Real-time Updates**: Socket.io for live inventory
2. **Payment Integration**: Stripe/Razorpay
3. **Order Tracking**: Status updates with notifications
4. **Reviews/Ratings**: Product feedback system
5. **Advanced Search**: Elasticsearch integration
6. **Mobile App**: React Native version
7. **Analytics Dashboard**: Sales/traffic insights
8. **Email Notifications**: SendGrid/Nodemailer
9. **Geolocation**: Find nearby shops
10. **Wishlist Feature**: Save favorite products

---

## Conclusion

MarketMate demonstrates a complete MERN stack implementation with:
- ✅ **Secure Authentication** (JWT + bcrypt)
- ✅ **Role-Based Access** (User/Shopkeeper/Admin)
- ✅ **RESTful API** (CRUD operations)
- ✅ **Database Relationships** (MongoDB references)
- ✅ **State Management** (React Context)
- ✅ **Responsive UI** (Tailwind CSS)
- ✅ **Image Handling** (Cloudinary)
- ✅ **Cart Management** (Session persistence)
- ✅ **Order Processing** (Stock management)
- ✅ **Admin Controls** (Approval workflow)

**Technologies Mastered:**
- Node.js & Express.js
- MongoDB & Mongoose
- React & React Router
- JWT Authentication
- RESTful API Design
- Context API
- Async/Await Patterns
- Environment Configuration
- Modern JavaScript (ES6+)

This project provides a solid foundation for understanding full-stack development, database design, authentication systems, and modern web application architecture.
