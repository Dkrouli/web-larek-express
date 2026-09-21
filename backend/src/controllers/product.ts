import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
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
      title, category, description, price, image,
    } = req.body;

    let imageObject: { fileName: string; originalName: string } | undefined;

    if (image) {
      const fileName = path.basename(image);

      const originalName = fileName;

      imageObject = {
        fileName: `/images/${fileName}`,
        originalName,
      };

      const tempPath = path.join(process.cwd(), 'temp', fileName);
      const finalDir = path.join(process.cwd(), 'images');
      const finalPath = path.join(finalDir, fileName);

      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }

      try {
        fs.copyFileSync(tempPath, finalPath);
        console.log(`Файл скопирован: ${fileName}`);
      } catch (copyError) {
        console.error('Ошибка копирования файла:', copyError);
        return next(new BadRequestError('Не удалось сохранить изображение товара'));
      }
    }

    const product = await Product.create({
      title,
      category,
      description,
      price,
      image: imageObject,
    });

    return res.status(201).json(product);
  } catch (err) {
    if (!(err instanceof Error)) {
      return next(new Error('Неизвестная ошибка сервера'));
    }

    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Ошибка валидации данных при создании товара'));
    }

    if (err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }

    return next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new BadRequestError('ID товара не указан'));
    }

    const deletedProduct = await Product.deleteOne({ _id: id });

    if (deletedProduct.deletedCount === 0) {
      return next(new NotFoundError('Товар не найден'));
    }

    return res.status(200).json({ message: 'Товар успешно удалён' });
  } catch (err) {
    return next(err);
  }
};
