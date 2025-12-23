# FashionRenewal Backend - Production-Ready API

> **A production-inspired, scalable backend for wardrobe optimization and P2P fashion marketplace**

Built with **NestJS**, **PostgreSQL**, **Prisma** - Production-ready with state machines, audit logs, payment processing, and admin tools.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker Desktop (for PostgreSQL)
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker-compose up -d

# 3. Setup database
npx prisma generate
npx prisma migrate dev --name initial_setup

# 4. Start server
npm run start:dev
```

Server runs on **http://localhost:3000**

## 📚 Full Documentation

See the main project README at `../README.md` for complete documentation.

## 🔗 API Endpoints

### Authentication
- `POST /auth/login` - Login
- `POST /users` - Sign up

### Wardrobe
- `POST /wardrobe` - Add item
- `GET /wardrobe` - List items
- `PATCH /wardrobe/:id` - Update item

### Marketplace
- `POST /marketplace/request` - Create order
- `PATCH /marketplace/order/:id/status` - Update status
- `GET /marketplace/orders` - View orders

### Admin (Requires ADMIN role)
- `POST /admin/disputes/:id/force-close` - Force close dispute
- `PATCH /admin/orders/:id/override-status` - Override status
- `GET /admin/actions` - View audit trail

## 🛠 Development Commands

```bash
# Start dev server
npm run start:dev

# Run tests
npm run test

# Database management
npx prisma studio
npx prisma migrate dev --name migration_name
```

## 📝 Environment Variables

Create `.env` file:
```
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/wardrobe_p2p"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
```

## 🎯 Production Features

- ✅ Order State Machine with strict transitions
- ✅ Anti Double-Booking with date conflict detection
- ✅ Subscription Enforcement via API guards
- ✅ Item Lifecycle Tracking (custody + condition)
- ✅ Audit Logging (immutable)
- ✅ Idempotency Keys (prevent duplicate orders)
- ✅ Payment Lifecycle Modeling (gateway-ready)
- ✅ Soft Deletes (data recovery)
- ✅ Admin APIs with override logging
- ✅ SLA Timers (auto-cancel, late returns)
- ✅ Optimistic Locking (concurrency protection)
- ✅ Transactional Consistency (Order + Payment)

---

**Part of the FashionRenewal monorepo**
