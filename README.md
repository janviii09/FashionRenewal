# FashionRenewal 👗

A sustainable fashion marketplace platform that enables users to rent, sell, and swap designer clothing. Built with modern web technologies and production-ready backend architecture.

## 🌟 Features

### Core Functionality
- **Wardrobe Management** - Upload and manage your clothing items with detailed information
- **Marketplace** - Browse and discover items available for rent, sale, or swap
- **Rental System** - Rent designer pieces with flexible date-based booking
- **Selling & Swapping** - List items for sale or swap with other users
- **User Reviews** - Rate and review transactions to build trust
- **Authentication** - Secure JWT-based authentication with email verification

### Advanced Features
- **Order State Machine** - Robust order lifecycle management with strict state transitions
- **Validation System** - Item validation workflow for quality assurance
- **Delivery Tracking** - Track shipments with status updates
- **Subscription Plans** - Tiered subscription system with rental limits
- **Trust Scores** - User reputation system based on transaction history
- **Audit Logging** - Comprehensive audit trail for all critical actions
- **Admin Dashboard** - Administrative tools for platform management
- **Anti Double-Booking** - Date conflict detection for rental items
- **Payment Integration** - Payment lifecycle modeling (gateway-ready)
- **Dispute Resolution** - Built-in dispute management system

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- Radix UI + Tailwind CSS for modern, accessible UI
- Zustand for state management
- React Hook Form + Zod for form validation
- Axios for API communication

**Backend**
- NestJS framework with TypeScript
- PostgreSQL database
- Prisma ORM for type-safe database access
- JWT authentication with Passport
- Bcrypt for password hashing
- Helmet for security headers
- Rate limiting and throttling

## 📁 Project Structure

```
FashionRenewal/
├── backend/              # NestJS Backend API
│   ├── src/
│   │   ├── auth/        # Authentication & JWT
│   │   ├── users/       # User management
│   │   ├── wardrobe/    # Item management
│   │   ├── marketplace/ # Orders & transactions
│   │   ├── review/      # Review system
│   │   ├── validation/  # Item validation
│   │   ├── delivery/    # Delivery tracking
│   │   ├── subscription/# Subscription management
│   │   └── recommendation/ # ML recommendations
│   ├── prisma/          # Database schema & migrations
│   └── package.json
│
├── frontend/            # React + Vite Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── stores/      # Zustand state stores
│   │   ├── lib/         # Utilities & API client
│   │   └── types/       # TypeScript type definitions
│   └── package.json
│
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker Desktop (for PostgreSQL)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/wardrobe_p2p"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   NODE_ENV="development"
   ```

5. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

   Backend runs on **http://localhost:3000**

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   Frontend runs on **http://localhost:5173**

## 🔧 Development

### Running Both Servers

Open two terminal windows:

**Terminal 1 - Backend**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

### Database Management

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Code Quality

**Backend**
```bash
npm run lint        # Run ESLint
npm run format      # Format with Prettier
npm run test        # Run tests
```

**Frontend**
```bash
npm run lint        # Run ESLint
npm run build       # Build for production
```

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /users` - User registration
- `POST /auth/verify-email` - Verify email address

### Wardrobe
- `GET /wardrobe` - Get user's wardrobe items
- `POST /wardrobe` - Add new item
- `PATCH /wardrobe/:id` - Update item
- `DELETE /wardrobe/:id` - Delete item (soft delete)

### Marketplace
- `GET /marketplace` - Browse available items
- `POST /marketplace/request` - Create rental/purchase order
- `GET /marketplace/orders` - Get user's orders
- `PATCH /marketplace/order/:id/status` - Update order status

### Reviews
- `POST /review` - Submit a review
- `GET /review/user/:id` - Get user's reviews

### Validation
- `POST /validation` - Request item validation
- `PATCH /validation/:id/approve` - Approve validation
- `PATCH /validation/:id/reject` - Reject validation

### Admin (Requires ADMIN role)
- `GET /admin/actions` - View audit trail
- `POST /admin/disputes/:id/force-close` - Force close dispute
- `PATCH /admin/orders/:id/override-status` - Override order status

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:3000"
```

## 🎯 Production Features

- ✅ **Order State Machine** - Strict order lifecycle with validated transitions
- ✅ **Anti Double-Booking** - Date conflict detection for rentals
- ✅ **Subscription Enforcement** - API guards for subscription limits
- ✅ **Item Lifecycle Tracking** - Custody and condition monitoring
- ✅ **Audit Logging** - Immutable audit trail for compliance
- ✅ **Idempotency Keys** - Prevent duplicate order creation
- ✅ **Payment Lifecycle** - Complete payment state management
- ✅ **Soft Deletes** - Data recovery and compliance
- ✅ **Admin Override System** - Administrative controls with logging
- ✅ **SLA Timers** - Automatic order expiration and late return tracking
- ✅ **Optimistic Locking** - Concurrency protection for critical operations
- ✅ **Transactional Consistency** - ACID guarantees for order + payment operations

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts with roles and trust scores
- **WardrobeItem** - Clothing items with availability status
- **Order** - Rental/sale/swap transactions
- **Review** - User reviews and ratings
- **Payment** - Payment tracking and lifecycle
- **Validation** - Item validation workflow
- **Delivery** - Shipment tracking
- **Subscription** - Subscription plans and user subscriptions
- **AuditLog** - System audit trail
- **Dispute** - Dispute management

## 🚢 Deployment

### Backend Deployment
Recommended platforms:
- Railway
- Render
- Heroku
- AWS/GCP/Azure

Database: Managed PostgreSQL (e.g., Railway, Supabase, AWS RDS)

### Frontend Deployment
Recommended platforms:
- Vercel (optimized for Vite)
- Netlify
- Cloudflare Pages

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

## 📝 License

UNLICENSED - Private project

---

**Built with ❤️ using NestJS, React, PostgreSQL, and Prisma**
