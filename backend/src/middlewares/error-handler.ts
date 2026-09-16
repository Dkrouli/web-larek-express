import { isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      message: 'Ошибка валидации данных при оформлении заказа',
    });
  }

  if (isCelebrateError(err)) {
    return res.status(400).json({
      message: 'Ошибка валидации данных при создании товара',
    });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      message: err.message,
    });
  }

  if (
    err instanceof BadRequestError
    || err instanceof NotFoundError
  ) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.message && typeof err.message === 'string' && err.message.includes('E11000')) {
    return res.status(409).json({
      message: 'Товар с таким названием уже существует',
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    message: 'Ошибка на сервере',
  });
};

export default errorHandler;
