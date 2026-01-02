# Docker Build & Deployment Guide

## 🐳 Building the Docker Image

### Local Build
```bash
# Build the image (from project root)
docker build --no-cache -t wardrobe-backend .

# Or with build args
docker build \
  --build-arg NODE_ENV=production \
  -t wardrobe-backend:latest \
  .
```

### Build Time
- **Expected**: 2-4 minutes (depending on network speed)
- **Image Size**: ~200-300 MB (Alpine-based)

---

## 🚀 Running the Container

### Basic Run
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret-key" \
  -e NODE_ENV="production" \
  wardrobe-backend
```

### With Environment File
```bash
# Create .env.production file
docker run -p 3000:3000 \
  --env-file backend/.env.production \
  wardrobe-backend
```

### With Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/wardrobe
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wardrobe
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🔧 Dockerfile Architecture

### Multi-Stage Build Explanation

**Stage 1: Dependencies**
- Base: `node:20.10-alpine`
- Purpose: Install all dependencies (including devDependencies)
- Why: Separates dependency installation for better caching

**Stage 2: Builder**
- Purpose: Build the NestJS application
- Steps:
  1. Copy dependencies from Stage 1
  2. Copy source code
  3. Generate Prisma Client
  4. Build NestJS app with `npm run build`
- Why: Isolates build artifacts

**Stage 3: Production**
- Purpose: Final runtime image
- Steps:
  1. Install ONLY production dependencies
  2. Copy built application from Stage 2
  3. Generate Prisma Client for runtime
  4. Run as non-root user
- Why: Minimal, secure production image

---

## 📦 Package.json Changes

### Build Script
**Before:**
```json
"build": "npx nest build"
```

**After:**
```json
"build": "nest build"
```

**Why:**
- `nest` command uses the local CLI from `node_modules/.bin/`
- No need for `npx` when dependencies are properly installed
- Works consistently in Docker and local environments

### DevDependencies
Ensure `@nestjs/cli` is in devDependencies:
```json
"devDependencies": {
  "@nestjs/cli": "^10.0.0",
  ...
}
```

---

## 🔐 Security Features

1. **Non-root User**: Runs as `nestjs` user (UID 1001)
2. **Alpine Base**: Minimal attack surface
3. **Health Check**: Built-in container health monitoring
4. **Production Dependencies Only**: Final image has no dev tools

---

## 🧪 Testing the Build

### 1. Build Test
```bash
docker build --no-cache -t wardrobe-backend .
```

### 2. Run Test
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://localhost:5432/test" \
  -e JWT_SECRET="test-secret" \
  wardrobe-backend
```

### 3. Health Check
```bash
curl http://localhost:3000/health
```

---

## 🐛 Troubleshooting

### Build Fails at Prisma Generate
**Issue**: `Error: @prisma/client did not initialize yet`

**Solution**: Ensure `DATABASE_URL` is set during build or use a placeholder:
```dockerfile
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
```

### Build Fails at `nest build`
**Issue**: `sh: nest: not found`

**Solution**: Ensure `@nestjs/cli` is in `devDependencies` and `npm ci` was run

### Container Exits Immediately
**Issue**: Missing environment variables

**Solution**: Provide all required env vars:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

---

## 📊 Image Size Optimization

Current setup achieves:
- **Dependencies stage**: ~400 MB (cached)
- **Builder stage**: ~500 MB (discarded)
- **Final image**: ~200-300 MB ✅

### Further Optimization
```dockerfile
# Use .dockerignore to exclude:
- node_modules
- dist
- test files
- documentation
```

---

## 🚢 Deployment Platforms

### Railway
Railway will auto-detect the Dockerfile and build it.

### Render
Add `render.yaml`:
```yaml
services:
  - type: web
    name: wardrobe-backend
    env: docker
    dockerfilePath: ./Dockerfile
```

### AWS ECS/Fargate
```bash
# Build and push to ECR
docker build -t wardrobe-backend .
docker tag wardrobe-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/wardrobe-backend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/wardrobe-backend:latest
```

---

## ✅ Production Checklist

- [ ] Dockerfile exists at project root
- [ ] Uses Node 20.10+ Alpine
- [ ] Multi-stage build implemented
- [ ] `@nestjs/cli` in devDependencies
- [ ] Build script uses `nest build` (not `npx`)
- [ ] Prisma generate in both build and production stages
- [ ] Runs as non-root user
- [ ] Health check configured
- [ ] `.dockerignore` optimized
- [ ] Environment variables documented
- [ ] Successfully builds with `docker build --no-cache`
- [ ] Successfully runs with proper env vars
