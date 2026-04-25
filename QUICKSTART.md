# Quick Start Guide

## 🚀 Start All Services (Windows)

### Option 1: Using Terminal Commands (Recommended)

**Terminal 1 - Backend**
```bash
cd backend
npm install
npm run dev
```
Expected output: `Server running on port 5000`

**Terminal 2 - ML Backend**
```bash
cd ml_backend
pip install -r req.txt
python app.py
```
Expected output: `Running on http://0.0.0.0:5000`

**Terminal 3 - Frontend**
```bash
cd frontend
npm install
npm run dev
```
Expected output: `VITE v4.x.x ready in ... ms`
Open: http://localhost:5173

---

## ✅ Verify Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:5000
# Should show API endpoints info
```

### 2. Check Flask Health
```bash
curl http://localhost:5001/health
# Should show: {"status": "ML service is running", "model_loaded": true/false}
```

### 3. Use the App
1. Go to http://localhost:5173
2. Sign up with test account
3. Go to Upload page
4. Select a rice leaf image
5. Click "Predict Disease"
6. View results

---

## 📋 Pre-Flight Checklist

- [ ] MongoDB running or Atlas connection string in `.env`
- [ ] `ml_backend/rice_model.h5` exists
- [ ] Backend `.env` has `ML_SERVICE_URL=http://localhost:5001`
- [ ] All 3 services running on different ports
- [ ] Frontend using `npm run dev` (NOT build)
- [ ] No CORS errors in browser console

---

## 🔧 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Cannot find module 'axios'" | Run `npm install` in backend folder |
| "Model not found" | Ensure `rice_model.h5` in `ml_backend/` |
| "CORS error" | Check if Flask running on port 5001 |
| "MongoDB connection failed" | Check MongoDB is running or update MONGODB_URI |
| "Port 5000 already in use" | Kill process: `netstat -ano \| findstr :5000` |

---

## 📊 Data Flow Summary

```
Upload Image (React)
        ↓
POST /api/disease/upload (Node)
        ↓
Save locally + Forward to Flask
        ↓
Flask predicts → Returns result
        ↓
Node saves to MongoDB
        ↓
Return record to React
        ↓
Display results
```

