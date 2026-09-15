import type { Request, Response, NextFunction } from "express";
import { faker } from "@faker-js/faker";
import Product from "../models/product";
import BadRequestError from "../errors/bad-request-error";
import NotFoundError from "../errors/not-found-error";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, items } = req.body;
    const productIds = items as string[];

    const products = await Promise.all(
      productIds.map((id: string) => Product.findById(id)),
    );

    if (products.some((p) => !p)) {
      return next(
        new NotFoundError("Не найдены один или несколько товаров из заказа"),
      );
    }

    if (products.some((p) => p!.price == null)) {
      return next(
        new BadRequestError(
          "Есть товар, недоступный для продажи (отсутствует цена)",
        ),
      );
    }

    const totalPrice = products.reduce((sum, p) => sum + p!.price!, 0);

    if (totalPrice !== total) {
      return next(
        new BadRequestError(
          `Общая стоимость заказа на сервере (${totalPrice}) не соответствует общей стоимости заказа (${total}) в запросе`,
        ),
      );
    }

    const id = faker.string.uuid();
    return res.status(201).json({ id, total });
  } catch (err) {
    return next(err);
  }
};

export default createOrder;
