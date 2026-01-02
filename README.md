# 👗 FashionRenewal

> **Your Wardrobe, Reimagined** - A sustainable P2P marketplace for renting, selling, and swapping fashion.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://fashion-renewal.vercel.app/)
[![Backend API](https://img.shields.io/badge/api-railway-blueviolet)](https://fashionrenewal.up.railway.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

FashionRenewal is a full-stack peer-to-peer fashion marketplace that enables users to rent, sell, and swap clothing items. Built with sustainability in mind, it helps reduce fashion waste while giving users access to a constantly refreshing wardrobe.

**🔗 Live Application**: [https://fashion-renewal.vercel.app/](https://fashion-renewal.vercel.app/)

---

## ✨ Key Features

### 🛍️ **Marketplace**
- **Rent** clothing for special occasions
- **Sell** pre-loved items
- **Swap** with other users
- **Browse** curated collections with advanced filtering
- **Personalized Recommendations** powered by ML algorithms

### 🔐 **Trust & Safety**
- **Dispute Resolution System** with evidence upload
- **Phone Verification** for trusted users
- **Trust Score System** based on transaction history
- **Secure Payments** (integration ready)

### 📸 **Smart Image Management**
- **4-Image Minimum Validation** for marketplace listings
- **Cloudinary Integration** for optimized image storage
- **Real-time Upload Feedback** with progress indicators
- **Image Quality Checks**

### 👤 **User Experience**
- **Personal Wardrobe Management**
- **Order Tracking** (rental/purchase history)
- **Review System** for buyers and sellers
- **Activity Tracking** for personalized recommendations
- **Responsive Design** - works on all devices

---

## 🏗️ Tech Stack

### **Frontend**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Routing**: React Router v6

### **Backend**
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **File Upload**: Cloudinary
- **Validation**: class-validator + class-transformer
- **Security**: Helmet, CORS, Rate Limiting

### **Deployment**
- **Frontend**: Vercel (Automatic deployments)
- **Backend**: Railway (PostgreSQL + Node.js)
- **CI/CD**: GitHub Actions ready

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- PostgreSQL database
- Cloudinary account (for image uploads)

### **1. Clone the Repository**
```bash
git clone https://github.com/janviii09/FashionRenewal.git
cd FashionRenewal
```

### **2. Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, and Cloudinary credentials

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

**Backend runs on**: `http://localhost:3000`

### **3. Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Start development server
npm run dev
```

**Frontend runs on**: `http://localhost:8080`

---

## 📁 Project Structure

```
FashionRenewal/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication & authorization
│   │   ├── wardrobe/          # Item management & marketplace
│   │   ├── marketplace/       # Orders & transactions
│   │   ├── dispute/           # Dispute resolution system
│   │   ├── verification/      # Phone verification & trust scores
│   │   ├── activity/          # User activity tracking
│   │   ├── subscription/      # Subscription management
│   │   └── cloudinary/        # Image upload service
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── lib/               # API client & utilities
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── stores/            # Zustand state stores
│   └── package.json
│
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

---

## 🔑 Environment Variables

### **Backend (.env)**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fashionrenewal

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=1h

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application
NODE_ENV=development
PORT=3000

# CORS (for production)
FRONTEND_URL=https://fashion-renewal.vercel.app
```

### **Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:3000
```

---

## 🧪 Testing

### **Run Backend Tests**
```bash
cd backend
npm run test
npm run test:e2e
```

### **Run Frontend Tests**
```bash
cd frontend
npm run test
```

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### **Quick Deploy**

**Frontend (Vercel)**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**Backend (Railway)**:
1. Connect your GitHub repo to Railway
2. Add environment variables
3. Deploy automatically on push to `main`

---

## 🎯 Core Features Implementation

### **4-Image Minimum Validation**
Marketplace listings (rent/sell/swap) require at least 4 images:
- ✅ Frontend: Real-time validation with visual feedback
- ✅ Backend: Service-layer validation (bypass-proof)
- ✅ User-friendly error messages
- ✅ Accessibility (ARIA labels)

### **Personalized Recommendations**
Smart product recommendations based on:
- User browsing history
- Category preferences
- Item similarity (brand, category, size)
- Collaborative filtering

### **Dispute Resolution**
Comprehensive system for handling transaction disputes:
- Evidence upload (images, documents)
- Timeline tracking
- Admin resolution tools
- Automated notifications

### **Trust & Safety**
- Phone verification for trusted sellers
- Trust score calculation
- Transaction history tracking
- Review system

---

## 🛠️ Development

### **Code Style**
- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type safety

### **Git Workflow**
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature-name
```

### **Database Migrations**
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

---

## 📊 Database Schema

Key models:
- **User** - User accounts with authentication
- **WardrobeItem** - Clothing items (personal + marketplace)
- **Order** - Rental/purchase transactions
- **Review** - User reviews and ratings
- **Dispute** - Dispute cases and evidence
- **UserActivity** - Browsing and interaction tracking
- **UserAffinity** - Personalized recommendation data

See `backend/prisma/schema.prisma` for full schema.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Janvi Gupta** - [@janviii09](https://github.com/janviii09)

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Deployed on [Vercel](https://vercel.com/) and [Railway](https://railway.app/)
- Image storage by [Cloudinary](https://cloudinary.com/)

---

## 📞 Support

For issues and questions:
- 🐛 [Report a bug](https://github.com/janviii09/FashionRenewal/issues)
- 💡 [Request a feature](https://github.com/janviii09/FashionRenewal/issues)
- 📧 Email: janvigupta@example.com

---

## 🗺️ Roadmap

- [ ] Payment integration (Stripe/Razorpay)
- [ ] Mobile app (React Native)
- [ ] AI-powered size recommendations
- [ ] Virtual try-on feature
- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

**⭐ Star this repo if you find it helpful!**
