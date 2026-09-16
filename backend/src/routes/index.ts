import express from 'express';
import productRouter from './product';
import orderRouter from './order';

const router = express.Router();
router.use('/product', productRouter);
router.use('/order', orderRouter);

export default router;
