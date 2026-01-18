# MarketMate

MarketMate is a simple MERN demo to compare prices from local shops, add products as shopkeepers, and approve shopkeepers via an admin panel. It is styled with a clean dark theme suitable for a short screen recording.

## Features
- Public product browsing with search, category filters, and sorting
- Shopkeeper registration, login, and product management
- Admin login to approve/reject shopkeepers
- Dark/Light theme toggle (persists across pages)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI

### Backend
1. Copy env template and fill values:
   - Create `.env` in `backend/` with:
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=supersecretjwt
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=5000
```
2. Install dependencies and run the server:
```
cd backend
npm install
npm run dev
```
3. Seed sample data (admin + 2 shops + 12 products):
```
npm run seed
```

### Frontend
1. Install and run dev server:
```
cd ../frontend
npm install
npm run dev
```
2. Open the Vite URL shown (usually http://localhost:5173).

## Demo Accounts
- Admin: admin@marketmate.com / admin123
- Shopkeepers are seeded and approved; login via their emails in the seed file if needed.

## Recording Tips
- Toggle between Dark/Light from the header or auth page.
- Show: Home hero -> Search -> Filter by category -> Sort -> Product cards.
- Admin flow: Login as admin -> Pending approvals (already empty after seeding) -> Approved list.
- Shopkeeper flow: Login -> Profile -> My Products -> Add Product (use image URL).

## Notes
- This project intentionally stays simple and suitable for a 2nd-year student portfolio piece.
- Tailwind CDN + a few custom utility classes are used for the theme without heavy config.
