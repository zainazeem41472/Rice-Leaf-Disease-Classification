import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Note: Prediction is handled via /api/disease/upload using Flask.
// This route file is limited to managing uploaded model files (optional).

const modelsDir = path.join(__dirname, '..', 'models_store');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir);
}

// Accept only .h5 files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, modelsDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'rice_leaf_disease_model.h5');
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = path.extname(file.originalname).toLowerCase() === '.h5';
  if (!allowed) return cb(new Error('Only .h5 Keras model files are allowed'));
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/model/upload - upload or replace model file
router.post('/upload', upload.single('model'), (req, res) => {
  return res.json({ success: true, filename: 'rice_leaf_disease_model.h5' });
});

// GET /api/model/status - check if model exists
router.get('/status', (req, res) => {
  const exists = fs.existsSync(path.join(modelsDir, 'rice_leaf_disease_model.h5'));
  res.json({ success: true, exists });
});

// Prediction endpoint removed. Use /api/disease/upload for predictions.

export default router;
