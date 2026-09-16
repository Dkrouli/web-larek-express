import type { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import NotFoundError from '../errors/not-found-error';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return next(new NotFoundError('Товары не найдены'));
    }
    return res.status(200).json({ items: products, total: products.length });
  } catch (err) {
    return next(err);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new BadRequestError('ID товара не указан'));
    }
    const product = await Product.findById(id);
    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }
    return res.status(200).json(product);
  } catch (err) {
    return next(err);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      description, image, title, category, price,
    } = req.body;

    const product = await Product.create({
      description,
      image,
      title,
      category,
      price,
    });

    return res.status(201).json(product);
  } catch (err) {
    if (!(err instanceof Error)) {
      return next(new Error('Неизвестная ошибка сервера'));
    }

    if (err.name === 'ValidationError') {
      return next(
        new BadRequestError('Ошибка валидации данных при создании товара'),
      );
    }

    if (err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }

    return next(err);
  }
};
