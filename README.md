# FashionRenewal - Production-Ready Wardrobe Backend

> **A battle-tested, scalable backend for wardrobe optimization and P2P fashion marketplace**

Built with **NestJS**, **PostgreSQL**, **Prisma** - Production-ready with state machines, audit logs, payment processing, and admin tools.

---

## 🎯 What This Project Does

FashionRenewal is a complete backend system for a **personal wardrobe management + P2P marketplace** platform that enables users to:

- 📦 **Manage Wardrobe** - Track clothing items, condition, wear frequency
- 🔄 **Rent Items** - Peer-to-peer rental marketplace with anti-double-booking
- 💰 **Sell/Swap** - List items for sale or swap with other users
- 📊 **Get Recommendations** - AI-powered suggestions based on wear patterns
- 💳 **Process Payments** - Full payment lifecycle (authorize, capture, refund)
- 🔐 **Subscription Plans** - Tiered access with usage limits
- 👮 **Admin Tools** - Customer support dashboard with override capabilities

---

## ✨ Production Features Implemented

### Core Business Logic
- ✅ **Order State Machine** - Strict state transitions (REQUESTED → APPROVED → PAID → DISPATCHED → DELIVERED → RETURNED → COMPLETED)
- ✅ **Anti Double-Booking** - Date-range locking prevents inventory conflicts
- ✅ **Subscription Enforcement** - API-level guards block requests when limits exceeded
- ✅ **Item Lifecycle Tracking** - Custody management, condition snapshots, damage reports
- ✅ **Audit Logging** - Immutable forensic trail for all critical actions

### Advanced Features
- ✅ **Idempotency Keys** - Prevents duplicate orders from network retries
- ✅ **Payment State Separation** - Full payment lifecycle (PENDING → AUTHORIZED → CAPTURED → REFUNDED)
- ✅ **Soft Deletes** - Never lose data, enable recovery
- ✅ **Admin Roles & Overrides** - Customer support tools with audit trails
- ✅ **SLA Timers** - Auto-cancel stale requests, flag late returns (cron-based)
- ✅ **Trust & Rating System** - User reputation scoring

---

## 🏗 Architecture

### Tech Stack
| Layer | Technology | Why |
|:------|:-----------|:----|
| **Framework** | NestJS (TypeScript) | Modular, scalable, enterprise-grade |
| **Database** | PostgreSQL | ACID compliance, complex queries, reliability |
| **ORM** | Prisma | Type-safe, migration management, modern DX |
| **Auth** | JWT + Passport | Stateless, scalable authentication |
| **Jobs** | @nestjs/schedule | Cron-based background tasks |
| **Containerization** | Docker | Consistent dev/prod environments |

### Modular Architecture

```
src/
├── auth/              # JWT authentication
├── users/             # User profiles, trust scores
├── wardrobe/          # Item CRUD, lifecycle tracking
├── marketplace/       # Orders, state machine, double-booking prevention
├── subscription/      # Plans, usage limits, enforcement
├── payment/           # Payment lifecycle (authorize, capture, refund)
├── audit/             # Immutable audit logs
├── admin/             # Admin overrides, customer support
├── jobs/              # SLA timers, cron jobs
├── wear-tracker/      # Usage logging
├── recommendation/    # Rule-based suggestions
└── common/            # Guards (idempotency, admin, subscription)
```

---

## 📊 Database Schema

### Core Models
- **User** - Profiles, roles (USER/ADMIN), trust scores, soft deletes
- **WardrobeItem** - Items with custody tracking, condition history
- **Order** - Rentals/swaps/sales with state machine, idempotency keys
- **Subscription** - Plans with rental limits, swap credits
- **UserSubscription** - User enrollment, usage counters

### Production Models
- **Payment** - Payment lifecycle (PENDING → AUTHORIZED → CAPTURED → REFUNDED)
- **AuditLog** - Immutable audit trail
- **ItemConditionHistory** - Before/after condition snapshots
- **AdminOverrideLog** - Admin action audit trail
- **Dispute** - Dispute management
- **RecommendationFeedback** - User feedback on recommendations

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+)
- **Docker Desktop** (for PostgreSQL)
- **npm**

### Installation

```bash
# 1. Navigate to project
cd /Users/janvigupta/Desktop/FashionRenewal

# 2. Install dependencies
npm install

# 3. Start PostgreSQL
docker-compose up -d

# 4. Create environment file
cat > .env << 'EOF'
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/wardrobe_p2p"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
EOF

# 5. Setup database
npx prisma generate
npx prisma migrate dev --name initial_setup

# 6. Start server
npm run start:dev
```

Server runs on **http://localhost:3000**

---

## 🔗 API Endpoints

### Authentication
```bash
POST /auth/login          # Login with email/password
POST /users               # Sign up
```

### Wardrobe Management
```bash
POST   /wardrobe          # Add item (Auth required)
GET    /wardrobe          # List items (filters: category, status)
GET    /wardrobe/:id      # Get item details
PATCH  /wardrobe/:id      # Update item
DELETE /wardrobe/:id      # Soft delete item
```

### Marketplace
```bash
POST  /marketplace/request              # Create order (Auth + Subscription + Idempotency guards)
PATCH /marketplace/order/:id/status     # Update status (State machine validation)
GET   /marketplace/orders?role=owner    # View orders
```

### Admin (Requires ADMIN role)
```bash
POST  /admin/disputes/:id/force-close       # Force close dispute
PATCH /admin/orders/:id/override-status     # Override order status
POST  /admin/users/:id/freeze               # Freeze user account
GET   /admin/actions                        # View admin audit trail
```

### Wear Tracking
```bash
POST /wear-tracker/:itemId/log    # Log wear event
GET  /wear-tracker/:itemId/stats  # Get wear statistics
```

### Recommendations
```bash
POST /recommendations/trigger     # Generate recommendations
```

---

## 🛡 Production-Grade Features

### 1. Idempotency
Prevents duplicate orders from network retries:
```bash
curl -H "Idempotency-Key: abc-123" POST /marketplace/request
# Second request with same key → 409 Conflict
```

### 2. State Machine
Enforces valid order transitions:
```
REQUESTED → APPROVED → PAID → DISPATCHED → DELIVERED → RETURNED → COMPLETED
                                                      ↓
                                                  CANCELLED
```

### 3. Anti Double-Booking
Transaction-level date conflict detection:
```typescript
// Prevents overlapping rentals for same item
Item #5: Jan 15-20 (booked)
Request: Jan 18-22 → ❌ ConflictException
```

### 4. Subscription Enforcement
API-level guards block requests when limits exceeded:
```typescript
// User with Basic plan (5 rentals/month)
6th rental request → ❌ ForbiddenException
```

### 5. Soft Deletes
Never lose data:
```typescript
// Deleted records have deletedAt timestamp
// All queries filter: where: { deletedAt: null }
```

### 6. Audit Logging
Every critical action is logged:
- Order creation/status changes
- Custody transfers
- Admin overrides
- Trust score updates

### 7. SLA Timers (Cron Jobs)
Automated enforcement:
- Auto-cancel REQUESTED orders > 24 hours old
- Flag late returns past endDate
- Runs hourly via `@nestjs/schedule`

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000
# Expected: "Hello World!"
```

### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
# Copy the access_token for authenticated requests
```

### Create Order with Idempotency
```bash
curl -X POST http://localhost:3000/marketplace/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: test-key-123" \
  -d '{
    "itemId": 1,
    "type": "RENT",
    "ownerId": 2,
    "startDate": "2024-02-01",
    "endDate": "2024-02-05"
  }'
```

---

## 📚 Database Management

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# Generate Prisma Client after schema changes
npx prisma generate
```

---

## 🔧 Development Commands

```bash
# Start dev server (auto-reload)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Lint code
npm run lint
```

---

## � Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f postgres

# Restart containers
docker-compose restart
```

---

## 🔐 Security Features

- **JWT Authentication** - Stateless, scalable auth
- **Role-Based Access Control** - USER, ADMIN, SUPER_ADMIN
- **Password Hashing** - bcrypt (configured in auth service)
- **Soft Deletes** - Data recovery, GDPR compliance
- **Audit Trails** - Immutable logs for compliance
- **Idempotency** - Prevents duplicate transactions

---

## 📈 Scalability Features

- **Modular Architecture** - Easy to split into microservices
- **Database Indexing** - Optimized queries on critical fields
- **Transaction Support** - ACID compliance for critical operations
- **Background Jobs** - Cron-based async processing
- **Stateless Auth** - Horizontal scaling ready

---

## 🎯 Use Cases

### For Users
1. Track wardrobe items and wear frequency
2. Rent items from other users
3. List items for rent/sale/swap
4. Get recommendations on underutilized items
5. Build trust score through successful transactions

### For Admins
1. Manually resolve disputes
2. Override order states (with audit trail)
3. Freeze problematic accounts
4. View all admin actions
5. Monitor system health

### For Developers
1. Extend with new modules (payments, shipping, etc.)
2. Integrate ML-based recommendations
3. Add real-time notifications
4. Build mobile/web frontends
5. Deploy to production with confidence

---

## 🚧 Future Enhancements

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Email/SMS notifications
- [ ] Advanced search & filters
- [ ] ML-based recommendations
- [ ] Real-time chat for negotiations
- [ ] Shipping integration
- [ ] Mobile app (React Native)
- [ ] Microservices separation

---

## � Project Structure

```
FashionRenewal/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── src/
│   ├── admin/                  # Admin module
│   ├── audit/                  # Audit logging
│   ├── auth/                   # Authentication
│   ├── common/                 # Shared guards, interceptors
│   ├── jobs/                   # Cron jobs
│   ├── marketplace/            # Orders, state machine
│   ├── payment/                # Payment lifecycle
│   ├── prisma/                 # Prisma service
│   ├── recommendation/         # Recommendation engine
│   ├── subscription/           # Subscription management
│   ├── users/                  # User management
│   ├── wardrobe/               # Wardrobe items
│   ├── wear-tracker/           # Usage tracking
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Entry point
├── docker-compose.yml          # PostgreSQL container
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── SETUP_GUIDE.md              # Detailed setup instructions
└── README.md                   # This file
```

---

## 🤝 Contributing

This is a production-ready backend built with startup-correct patterns:
- Domain correctness (item lifecycle, custody tracking)
- Data correctness (state machines, date locking)
- Business rule enforcement (subscriptions, limits)
- Safety & trust (audit logs, disputes)
- Scale & future-proofing (modular, extensible)

---

## � License

MIT License - Feel free to use for your projects!

---

## 🙏 Acknowledgments

Built with production-grade patterns learned from real startup failures:
- Idempotency keys (prevents double-charges)
- Payment state separation (handles refunds correctly)
- Soft deletes (data recovery)
- Admin overrides (customer support)
- SLA timers (automated cleanup)

---

## 📞 Support

For issues or questions:
1. Check `SETUP_GUIDE.md` for detailed instructions
2. Review server logs: `npm run start:dev`
3. Check database: `npx prisma studio`
4. Verify Docker: `docker-compose logs`

---

**Built with ❤️ using NestJS, PostgreSQL, and Prisma**

*Production-ready backend for the next generation of fashion marketplaces*
