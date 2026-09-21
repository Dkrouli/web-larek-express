import express from 'express';
import uploadFile from '../controllers/upload';
import authenticate from '../middlewares/auth';
import fileMiddleware from '../middlewares/file';

const router = express.Router();

router.post('/', authenticate, fileMiddleware.single('file') as any, uploadFile as any);

export default router;
