import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import {
  uploadAndDetect,
  getDiseaseHistory,
  getDiseaseById,
  deleteDisease,
} from '../controllers/diseaseController.js';
import { protect } from '../middleware/auth.js';

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter — extension check karo, mimetype pe rely mat karo
// Flutter Web galat mimetype (application/octet-stream) bhejta hai
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png/;
  const extname = allowedExts.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    return cb(null, true); // ✅ Sirf extension check — mimetype ignore
  } else {
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter,
});

// Routes
router.post('/upload', upload.single('image'), uploadAndDetect); // public — Flutter ke liye
router.get('/history', protect, getDiseaseHistory);
router.get('/:id', protect, getDiseaseById);
router.delete('/:id', protect, deleteDisease);

export default router;