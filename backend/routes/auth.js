import express from 'express';
const router = express.Router();
import { signup, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Private routes
router.get('/profile', protect, getProfile);

export default router;