import express from 'express';
import { getProducts, createProduct, getProduct } from '../controllers/product';
import { validateProductId, validateCreateProduct } from '../middlewares/validation'

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', validateProductId, getProduct);
router.post('/', validateCreateProduct, createProduct);

export default router;