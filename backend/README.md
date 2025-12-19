# MarketMate Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file and add your MongoDB Atlas URI and other credentials.

### 3. Run the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new shopkeeper
- POST `/api/auth/login` - Login shopkeeper
- GET `/api/auth/profile` - Get profile (Protected)

### Products
- GET `/api/products` - Get all products (Public)
- GET `/api/products/offers/today` - Get today's offers (Public)
- GET `/api/products/compare/:productName` - Compare prices (Public)
- GET `/api/products/:id` - Get single product (Public)
- POST `/api/products` - Create product (Protected)
- GET `/api/products/my/products` - Get my products (Protected)
- PUT `/api/products/:id` - Update product (Protected)
- DELETE `/api/products/:id` - Delete product (Protected)
