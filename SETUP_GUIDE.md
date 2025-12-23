# Complete Setup Guide - Wardrobe Backend

## 📋 Prerequisites

Before starting, ensure you have these installed on your Mac:

### 1. Install Node.js (if not already installed)
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from: https://nodejs.org/
# Or install via Homebrew:
brew install node
```

### 2. Install Docker Desktop (for PostgreSQL)
```bash
# Download from: https://www.docker.com/products/docker-desktop/

# Or install via Homebrew:
brew install --cask docker

# After installation, open Docker Desktop app to start the Docker daemon
```

---

## 🚀 Step-by-Step Setup

### Step 1: Navigate to Project Directory
```bash
cd /Users/janvigupta/Desktop/FashionRenewal
```

### Step 2: Install Dependencies
```bash
# This will install all packages from package.json
npm install

# This may take 2-3 minutes
# You should see a progress bar and eventually "added XXX packages"
```

### Step 3: Start PostgreSQL Database
```bash
# Start Docker containers (PostgreSQL)
docker-compose up -d

# Verify it's running
docker ps

# You should see a container named "wardrobe_postgres" running
```

### Step 4: Create Environment File
```bash
# Create .env file in project root
cat > .env << 'EOF'
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/wardrobe_p2p"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
EOF

# Verify file was created
cat .env
```

### Step 5: Run Database Migrations
```bash
# Generate Prisma Client (creates TypeScript types)
npx prisma generate

# Create and apply database migrations
npx prisma migrate dev --name initial_setup

# You should see:
# ✔ Generated Prisma Client
# ✔ Database migrations applied
```

### Step 6: (Optional) Seed Database with Test Data
```bash
# Open Prisma Studio to manually add data
npx prisma studio

# This opens a browser at http://localhost:5555
# You can manually create:
# - Users (with role: USER or ADMIN)
# - Wardrobe Items
# - Subscriptions
```

### Step 7: Start the Development Server
```bash
# Start NestJS server
npm run start:dev

# You should see:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [InstanceLoader] AppModule dependencies initialized
# [Nest] LOG Application is running on: http://localhost:3000
```

---

## ✅ Verify Everything is Working

### Test 1: Health Check
```bash
# Open new terminal window
curl http://localhost:3000

# Expected response: "Hello World!"
```

### Test 2: Create a User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Expected: User object with id, email, name
```

### Test 3: Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: { "access_token": "eyJhbGc..." }
# Copy this token for next tests
```

### Test 4: Create Wardrobe Item (Authenticated)
```bash
# Replace YOUR_TOKEN with the access_token from login
curl -X POST http://localhost:3000/wardrobe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "category": "Shirt",
    "brand": "Nike",
    "size": "M",
    "condition": "GOOD",
    "status": "KEEP",
    "isRentable": true
  }'

# Expected: Wardrobe item object
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "npm: command not found"
**Solution:**
```bash
# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

### Issue 2: "docker: command not found"
**Solution:**
```bash
# Install Docker Desktop
brew install --cask docker

# Open Docker Desktop app
open -a Docker

# Wait for Docker to start (whale icon in menu bar)
```

### Issue 3: "Error: P1001: Can't reach database server"
**Solution:**
```bash
# Check if PostgreSQL container is running
docker ps

# If not running, start it
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Issue 4: "Prisma Client not generated"
**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Restart dev server
npm run start:dev
```

### Issue 5: Port 3000 already in use
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual number)
kill -9 PID

# Or change port in src/main.ts:
# await app.listen(3001);
```

---

## 📚 Useful Commands

### Database Management
```bash
# Open Prisma Studio (visual database editor)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database schema
npx prisma db pull
```

### Development
```bash
# Start dev server (auto-reload on changes)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test
```

### Docker
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart
```

---

## 🧪 Testing Production Features

### Test Idempotency
```bash
# Create order with idempotency key
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

# Run same request again - should return 409 Conflict
```

### Test Admin Endpoints
```bash
# First, set user role to ADMIN in database
# Open Prisma Studio: npx prisma studio
# Edit user, set role = "ADMIN"

# Then test admin endpoint
curl -X POST http://localhost:3000/admin/disputes/1/force-close \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "reason": "Customer confirmed resolution",
    "resolution": "Refund issued"
  }'
```

### Test Soft Deletes
```bash
# Delete an order (soft delete)
curl -X DELETE http://localhost:3000/marketplace/order/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Verify in Prisma Studio - deletedAt should be set
npx prisma studio
```

---

## 📊 Monitoring Cron Jobs

The SLA service runs hourly cron jobs. To see them in action:

```bash
# Check server logs
# You should see messages like:
# "Auto-cancelled X stale REQUESTED orders"
# "Flagged X late returns"

# To test immediately, you can manually trigger:
# 1. Create an order with createdAt set to 25 hours ago
# 2. Wait for next hour or restart server
```

---

## 🎯 Next Steps

1. **Create Subscription Plans**
   ```bash
   # Use Prisma Studio to create subscription records
   npx prisma studio
   # Navigate to Subscription table
   # Add plans like:
   # - Basic: rentalLimit=5, swapCredits=2, price=9.99
   # - Premium: rentalLimit=20, swapCredits=10, price=29.99
   ```

2. **Assign Subscriptions to Users**
   ```bash
   # In Prisma Studio, create UserSubscription records
   # Link user to subscription plan
   ```

3. **Test Full Order Flow**
   ```bash
   # 1. Create user
   # 2. Assign subscription
   # 3. Create wardrobe item
   # 4. Create rental order
   # 5. Update order status through state machine
   # 6. Check audit logs
   ```

---

## 📞 Support

If you encounter issues:
1. Check server logs: `npm run start:dev` output
2. Check database: `npx prisma studio`
3. Check Docker: `docker-compose logs`
4. Verify environment: `cat .env`

All lint errors about missing `@nestjs` modules will disappear after `npm install`.
