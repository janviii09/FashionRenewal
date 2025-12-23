# FashionRenewal - Monorepo Structure

This is a monorepo containing both the backend (NestJS) and frontend (Next.js) for the FashionRenewal marketplace.

## 📁 Project Structure

```
FashionRenewal/
├── backend/              # NestJS Backend API
│   ├── src/             # Backend source code
│   ├── prisma/          # Database schema & migrations
│   ├── package.json     # Backend dependencies
│   └── README.md        # Backend documentation
│
├── frontend/            # Next.js Frontend (to be generated)
│   ├── app/            # Next.js 14 App Router pages
│   ├── components/     # React components
│   ├── lib/            # Utilities, API client
│   ├── public/         # Static assets
│   ├── package.json    # Frontend dependencies
│   └── README.md       # Frontend documentation
│
├── docs/               # Shared documentation
│   ├── FRONTEND_PROMPT.md
│   └── SETUP_GUIDE.md
│
└── README.md          # Main project README (this file)
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
docker-compose up -d
npx prisma migrate dev
npm run start:dev
```
Backend runs on: **http://localhost:3000**

### Frontend Setup (After Generation)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: **http://localhost:3001**

## 🔗 Connecting Frontend & Backend

The backend is already configured to accept requests from the frontend. No additional setup needed!

## 📚 Documentation

- **Backend API**: See `backend/README.md`
- **Frontend Guide**: See `frontend/README.md` (after generation)
- **Setup Instructions**: See `docs/SETUP_GUIDE.md`
- **Frontend Prompt**: See `docs/FRONTEND_PROMPT.md`

## 🛠 Development

### Running Both Servers
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Database Management
```bash
cd backend
npx prisma studio  # Visual database editor
npx prisma migrate dev --name migration_name  # Create migration
```

## 📦 Deployment

### Backend
- **Platform**: Railway / Render / Heroku
- **Database**: PostgreSQL (managed)
- **URL**: `https://api.fashionrenewal.com`

### Frontend
- **Platform**: Vercel (recommended for Next.js)
- **URL**: `https://fashionrenewal.com`

## 🔐 Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
NODE_ENV="development"
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 📝 Next Steps

1. ✅ Backend is ready and running
2. ⏳ Generate frontend using `docs/FRONTEND_PROMPT.md`
3. ⏳ Place generated frontend files in `frontend/` folder
4. ⏳ Connect frontend to backend API
5. ⏳ Deploy to production

---

**Built with ❤️ using NestJS, PostgreSQL, Prisma, and Next.js**
