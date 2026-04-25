# Rice Disease Detection - Production Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (PORT 5173)               │
│  - User uploads rice leaf image                             │
│  - Displays prediction results & history                    │
│  - Authentication & Protected routes                        │
└────────────────────────┬────────────────────────────────────┘
                         │ POST /api/disease/upload (FormData)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            NODE/EXPRESS BACKEND (PORT 5000)                 │
│  - Receives image from frontend                             │
│  - Saves image locally (uploads/)                           │
│  - Forwards to Flask ML backend                             │
│  - Receives prediction result                               │
│  - Saves record to MongoDB                                  │
│  - Returns record to frontend                               │
└────────┬────────────────────────────────────┬───────────────┘
         │                                    │
         │ POST /predict (multipart/form-data)│ GET/DELETE/PUT
         ▼                                    ▼
┌──────────────────────┐            ┌─────────────────┐
│  FLASK ML BACKEND    │            │    MongoDB      │
│  (PORT 5000 or 5001) │            │    Database     │
│                      │            │                 │
│ - Loads TensorFlow   │            │ - Stores users  │
│   model              │            │ - Stores results│
│ - Preprocesses image │            │ - Auth tokens   │
│ - Runs prediction    │            └─────────────────┘
│ - Returns:           │
│   * diseaseName      │
│   * confidence       │
│   * description      │
│   * treatment        │
└──────────────────────┘
```

## ✅ Clean Separation of Concerns

### React Frontend
- **Responsibility**: UI/UX only
- **Tasks**:
  - Image selection & preview
  - Form submission
  - Authentication handling (JWT token)
  - Display results
  - Show user history

### Node/Express Backend
- **Responsibility**: API, file handling, database
- **Tasks**:
  - Receive image from frontend (multipart/form-data)
  - Save image to disk (`backend/uploads/`)
  - Forward image to Flask ML service
  - Receive prediction result from Flask
  - Save prediction result to MongoDB
  - Return saved record to frontend
  - **NEVER stores data directly from Flask to MongoDB in Flask**

### Flask ML Backend
- **Responsibility**: ML prediction only
- **Tasks**:
  - Receive image file from Node backend
  - Preprocess image (resize, normalize, etc.)
  - Load TensorFlow/Keras model
  - Run prediction
  - Return prediction result (JSON)
  - **NO database operations, NO file persistence**

### MongoDB
- **Responsibility**: Data persistence
- Stores: Users, Disease predictions, Images paths

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- MongoDB (local or Atlas)
- pip package manager

### 1️⃣ Backend Setup (Node/Express)

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rice-disease
JWT_SECRET=your_super_secret_key_change_this
ML_SERVICE_URL=http://localhost:5001
```

Run backend:
```bash
npm run dev    # With nodemon
# OR
npm start      # Direct Node
```

### 2️⃣ ML Backend Setup (Flask)

```bash
cd ml_backend
pip install -r req.txt
```

Optional: Create `.env` file:
```env
FLASK_ENV=development
FLASK_PORT=5001
```

Run Flask:
```bash
python app.py
```

Access health check: `http://localhost:5001/health`

### 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Data Flow Diagram

### Successful Prediction Flow

```
1. User selects image in React
   ↓
2. React sends: POST /api/disease/upload
   - Headers: Authorization: Bearer <token>
   - Body: FormData { image: File }
   ↓
3. Node/Express receives image
   - Validates authentication
   - Validates file (type, size)
   - Saves to: backend/uploads/<timestamp>-<filename>
   ↓
4. Node creates FormData and sends to Flask
   - POST http://localhost:5001/predict
   - Body: FormData { image: <binary data> }
   ↓
5. Flask processes image
   - Preprocess: Resize to 224x224, normalize
   - Load model: rice_model.h5
   - Predict: Get disease class & confidence
   ↓
6. Flask returns prediction
   Response (JSON):
   {
     "diseaseName": "Bacterial leaf blight",
     "confidence": 87.5,
     "description": "...",
     "treatment": "..."
   }
   ↓
7. Node receives prediction from Flask
   - Creates Disease document
   - Saves to MongoDB:
     {
       user: <userId>,
       diseaseName: "Bacterial leaf blight",
       confidence: "87.5%",
       description: "...",
       treatment: "...",
       imagePath: "/uploads/1703345678900-leaf.jpg",
       createdAt: <timestamp>
     }
   ↓
8. Node sends saved record to React
   Response (JSON):
   {
     "success": true,
     "data": {
       _id: "<recordId>",
       diseaseName: "Bacterial leaf blight",
       ...
     }
   }
   ↓
9. React stores in localStorage and navigates to /result
   ↓
10. Result component displays prediction
```

---

## 🔒 Security Implementation

### Authentication (Node/Express)
- JWT tokens stored in sessionStorage (frontend)
- All disease routes protected with `protect` middleware
- User can only access their own disease records
- Passwords hashed with bcryptjs

### Authorization (Node/Express)
- Verify JWT on protected routes
- Ensure user owns the disease record before returning/deleting

### File Handling (Node/Express)
- Validate file type (jpeg, jpg, png only)
- Limit file size (5MB max)
- Sanitize filename with timestamp prefix
- Clean up file if prediction fails

### CORS (Both)
- Frontend CORS configured
- Flask allows cross-origin requests

---

## 📁 Directory Structure

```
backend/
├── app.js
├── package.json
├── .env                  (Create this!)
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   └── diseaseController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   └── Disease.js
├── routes/
│   ├── auth.js
│   └── disease.js
└── uploads/             (Auto-created when images uploaded)
    └── 1703345678900-leaf.jpg

ml_backend/
├── app.py
├── req.txt
├── rice_model.h5        (Ensure this exists!)
└── .env                 (Optional)

frontend/
├── package.json
├── src/
│   ├── App.jsx
│   └── components/
│       ├── Upload.jsx
│       ├── Result.jsx
│       └── ...
```

---

## 🧪 Testing the Flow

### 1. Check Flask Health
```bash
curl http://localhost:5001/health
# Expected: {"status": "ML service is running", "model_loaded": true}
```

### 2. Test Prediction Directly (Skip Node)
```bash
curl -X POST -F "image=@leaf.jpg" http://localhost:5001/predict
# Expected: {"diseaseName": "Brown spot", "confidence": 92.1, ...}
```

### 3. Full Flow via UI
1. Open `http://localhost:5173` (Frontend)
2. Sign up / Login
3. Go to Upload page
4. Select a rice leaf image
5. Click "Predict Disease"
6. Should see prediction and result page

---

## 🐛 Troubleshooting

### Error: "ML backend unreachable"
- Check if Flask is running: `python app.py`
- Check `ML_SERVICE_URL` in backend `.env`
- Ensure port 5001 is not blocked by firewall

### Error: "Model not loaded"
- Ensure `rice_model.h5` exists in `ml_backend/` folder
- Check TensorFlow version compatibility

### Error: "No image uploaded"
- Frontend validation failed or file didn't send
- Check browser console for errors
- Ensure file is valid JPG/PNG < 5MB

### MongoDB connection failed
- Ensure MongoDB is running locally or check Atlas connection string
- Update `MONGODB_URI` in `.env`

### CORS errors
- Check backend CORS configuration
- Verify frontend is making requests to correct URL

---

## 📊 API Endpoints

### Disease Prediction
```
POST /api/disease/upload
Headers:
  - Content-Type: multipart/form-data
  - Authorization: Bearer <jwt_token>
Body:
  - image: <file>
Response:
  {
    "success": true,
    "data": {
      "_id": "...",
      "diseaseName": "Bacterial leaf blight",
      "confidence": "87.5%",
      "description": "...",
      "treatment": "...",
      "imagePath": "/uploads/...",
      "createdAt": "2024-12-23T..."
    }
  }
```

### Disease History
```
GET /api/disease/history
Headers:
  - Authorization: Bearer <jwt_token>
Response:
  {
    "success": true,
    "count": 5,
    "data": [...]
  }
```

### Get Record by ID
```
GET /api/disease/:id
Headers:
  - Authorization: Bearer <jwt_token>
```

### Delete Record
```
DELETE /api/disease/:id
Headers:
  - Authorization: Bearer <jwt_token>
```

---

## 🎯 Key Implementation Points

✅ **Flask responsibility**: ML prediction ONLY  
✅ **Node responsibility**: Data management & API  
✅ **Proper flow**: React → Node → Flask → Node → MongoDB → React  
✅ **Error handling**: Cleanup uploads on failure  
✅ **Security**: JWT auth, file validation, ownership checks  
✅ **Separation of concerns**: Each service has single responsibility  

---

## 📝 Notes

- Flask runs on port 5001 (configurable)
- Backend Node runs on port 5000
- Frontend Vite runs on port 5173
- All three must be running for full functionality
- Never modify this architecture - it's production-ready

