import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

router.post('/', protect, authorize('farmer', 'seller', 'admin'), createProduct);
router.put('/:id', protect, authorize('farmer', 'seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('farmer', 'seller', 'admin'), deleteProduct);

export default router;
