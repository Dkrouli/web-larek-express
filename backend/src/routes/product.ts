import express from 'express';
import authenticate from '../middlewares/auth';
import {
  getProducts,
  createProduct,
  getProduct,
  deleteProduct,
} from '../controllers/product';
import { validateProductId } from '../middlewares/validation';

const router = express.Router();

router.get('/', getProducts);

router.get('/:id', validateProductId, getProduct);

router.post('/', authenticate, createProduct);

router.delete('/:id', authenticate, validateProductId, deleteProduct);

export default router;
