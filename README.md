# QuickOutfit — Hyperlocal Fashion Marketplace
🚀 A production-ready, full-stack fashion marketplace platform built by transforming a simple HTML prototype into a robust React + Node.js application.

## 🏗️ Architecture Stack
* **Frontend**: React.js, Vite, Zustand (State Management), React Router
* **Backend**: Node.js, Express.js, Socket.IO
* **Database**: MongoDB (Mongoose) with Geospatial (`$near`) and TTL indexing
* **AI Integration**: Google Gemini 1.5 Flash (Shade AI feature)
* **Cloud Infrastructure**: Cloudinary (Image storage), Vercel (Frontend), Render (Backend)

## 📁 Project Structure
* `frontend_new/`: Modern component-based React SPA.
* `backend/`: Express REST API serving the application and integrations.

---

## 💻 Local Development

### 1. Backend Setup
```bash
cd backend
npm install
```

**Environment Variables (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

**Start the server:**
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend_new
npm install
```

**Environment Variables (`frontend_new/.env`):**
```env
VITE_API_BASE=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Start the application:**
```bash
npm run dev
```

---

## ⚡ Deployment Guide (Free Tier)

This platform is configured for free-tier deployments on **Render** (Backend) and **Vercel** (Frontend).

### Deploying the Backend (Render)
1. Push this repository to GitHub.
2. Sign up on [Render.com](https://render.com).
3. Click "New" > "Blueprint" and connect your GitHub repository.
4. Render will automatically detect the `backend/render.yaml` blueprint file.
5. Provide all the required environment variables (MongoDB URI, Gemini Key, Cloudinary Keys) when prompted in the Render dashboard.
6. Copy the deployed backend URL (e.g., `https://quickoutfit-backend.onrender.com`).

### Deploying the Frontend (Vercel)
1. Sign up on [Vercel.com](https://vercel.com).
2. Click "Add New" > "Project" and import your GitHub repository.
3. Configure the Root Directory to be `frontend_new`.
4. Add the following Environment Variables in Vercel:
   * `VITE_API_BASE`: `https://quickoutfit-backend.onrender.com/api` (Use your actual Render URL)
   * `VITE_SOCKET_URL`: `https://quickoutfit-backend.onrender.com`
5. The `vercel.json` is already included to handle SPA routing.
6. Click Deploy.

## 👤 Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@quickoutfit.com | admin123 |
| Customer | user@demo.com | password |
| Shopkeeper | shop@demo.com | password |
| Delivery | delivery@demo.com | password |

*(Note: Run the database seeder to populate these if starting fresh)*
