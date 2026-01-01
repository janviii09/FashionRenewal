# 🚀 Quick Deployment Guide

## ✅ Prerequisites Completed
- [x] Code committed and pushed to GitHub
- [x] Deployment configuration files created
- [x] Environment variables template ready

---

## 🎯 Deploy in 3 Steps

### **Step 1: Deploy Database & Backend (Railway - Easiest)**

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `FashionRenewal` repository

3. **Add PostgreSQL**
   - In your project, click "New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will automatically create the database

4. **Configure Backend Service**
   - Click "New" → "GitHub Repo" → Select `FashionRenewal`
   - **IMPORTANT**: Railway needs to know this is a monorepo
   - Go to **Settings** tab:
     - **Root Directory**: Leave empty (Railway will use railway.json)
     - **Watch Paths**: `backend/**`
   - The build/start commands are configured in `railway.json` at the root
   
   > **Note**: We've added `railway.json` to tell Railway how to build from the backend folder
   
5. **Add Environment Variables**
   Click on backend service → "Variables" tab → "RAW Editor" → Paste:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-random-32-char-secret-here-change-this
   JWT_EXPIRES_IN=1h
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://fashion-renewal.vercel.app
   ```
   
   **Important**: 
   - Replace `your-random-32-char-secret-here-change-this` with a random string
   - Get Cloudinary credentials from [cloudinary.com/console](https://cloudinary.com/console)
   - We'll update `FRONTEND_URL` after deploying frontend

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your backend URL (e.g., `https://fashionrenewal-production.up.railway.app`)

---

### **Step 2: Deploy Frontend (Vercel)**

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select `FashionRenewal` from GitHub

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.railway.app
     ```
   - Use the Railway URL from Step 1

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Copy your frontend URL (e.g., `https://fashion-renewal.vercel.app`)

---

### **Step 3: Update CORS**

1. **Go back to Railway**
   - Open your backend service
   - Go to "Variables" tab
   - Update `FRONTEND_URL` to your Vercel URL
   - Click "Deploy" to restart

2. **Test Your App**
   - Visit your Vercel URL
   - Try logging in
   - Test creating an item (4-image validation should work!)

---

## 🎉 You're Live!

**Frontend**: `https://fashion-renewal.vercel.app`  
**Backend**: `https://fashionrenewal-production.railway.app`

---

## 🔧 Troubleshooting

### **CORS Error**
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Redeploy backend after changing

### **Database Connection Error**
- Check Railway logs: Service → Logs
- Verify `DATABASE_URL` is set correctly
- Make sure PostgreSQL service is running

### **Images Not Uploading**
- Verify Cloudinary credentials in Railway
- Check browser console for errors

### **500 Error on Backend**
- Check Railway logs for details
- Verify all environment variables are set
- Make sure migrations ran successfully

---

## 📊 Monitor Your App

**Railway Logs**: Dashboard → Service → Logs  
**Vercel Logs**: Dashboard → Deployments → [Latest] → View Function Logs  
**Database**: Railway → PostgreSQL → Data tab

---

## 💡 Pro Tips

1. **Custom Domain**: Add in Vercel → Settings → Domains
2. **Auto-Deploy**: Already enabled! Push to `main` = auto-deploy
3. **Rollback**: Vercel → Deployments → Previous deployment → "Promote to Production"
4. **Database Backups**: Railway does this automatically
5. **Monitoring**: Add Sentry or LogRocket for error tracking

---

## 🆘 Need Help?

- Railway docs: [docs.railway.app](https://docs.railway.app)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Prisma deployment: [pris.ly/d/deploy](https://pris.ly/d/deploy)

**Common commands**:
```bash
# View Railway logs
railway logs

# Run migrations manually
railway run npx prisma migrate deploy

# Connect to database
railway connect postgres
```
