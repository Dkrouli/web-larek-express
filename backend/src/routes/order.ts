import express from 'express';
import createOrder from '../controllers/order';
import { validateCreateOrder } from '../middlewares/validation';

const router = express.Router();

router.post('/', validateCreateOrder, createOrder);

export default router;
