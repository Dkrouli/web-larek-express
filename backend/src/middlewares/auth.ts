import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: 'Внутренняя ошибка сервера (JWT_SECRET не найден)' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Требуется авторизация'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secret) as unknown as { id: string; email: string };

    (req as any).user = decoded;

    return next();
  } catch (error) {
    return next(new UnauthorizedError('Недействительный токен'));
  }
};

export default authenticate;
