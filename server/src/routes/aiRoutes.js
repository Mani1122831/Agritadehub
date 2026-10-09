import express from 'express';
import { aiChat, getAiInsights, generateAiImage } from '../controllers/aiController.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Optional user attachment for AI personalization
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agritrade-hub-development-jwt-secret-2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // ignore
    }
  }
  next();
};

router.post('/chat', optionalAuth, aiChat);
router.get('/insights', getAiInsights);
router.post('/generate-image', generateAiImage);

export default router;
