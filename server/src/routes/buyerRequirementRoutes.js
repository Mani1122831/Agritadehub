import express from 'express';
import {
  createRequirement,
  getRequirements,
  getRequirementById,
} from '../controllers/buyerRequirementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createRequirement);
router.get('/', protect, getRequirements);
router.get('/:id', protect, getRequirementById);

export default router;
