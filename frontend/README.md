# Frontend Placeholder

This folder will contain the Next.js frontend application.

## 📋 How to Generate Frontend

1. Use the prompt in `../docs/FRONTEND_PROMPT.md`
2. Generate the Next.js app using AI or manually
3. Place all generated files in this folder

## 📁 Expected Structure (After Generation)

```
frontend/
├── app/                 # Next.js 14 App Router
│   ├── page.tsx        # Landing page
│   ├── login/
│   ├── signup/
│   ├── browse/
│   ├── dashboard/
│   └── layout.tsx
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   ├── ItemCard.tsx
│   ├── OrderCard.tsx
│   └── ...
├── lib/                # Utilities
│   ├── api.ts          # Axios setup
│   └── store.ts        # Zustand stores
├── public/             # Static assets
├── styles/             # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🚀 Quick Start (After Generation)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: **http://localhost:3001**

## 🔗 API Connection

The frontend will connect to the backend at:
- **Development**: `http://localhost:3000`
- **Production**: `https://api.fashionrenewal.com`

Configure in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📚 Documentation

See `../docs/FRONTEND_PROMPT.md` for complete frontend generation instructions.
