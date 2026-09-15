import { isCelebrateError } from "celebrate";
import { NextFunction, Request, Response } from "express";
import BadRequestError from "../errors/bad-request-error";
import ConflictError from "../errors/conflict-error";
import NotFoundError from "../errors/not-found-error";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (isCelebrateError(err)) {
    return res
      .status(400)
      .json({ message: err.message || "Ошибка валидации данных" });
  }

  if (
    err instanceof BadRequestError ||
    err instanceof ConflictError ||
    err instanceof NotFoundError
  ) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof Error && (err.message as string).includes("E11000")) {
    const conflictErr = new ConflictError(
      "Товар с таким названием уже существует",
    );
    return res
      .status(conflictErr.statusCode)
      .json({ message: conflictErr.message });
  }

  if (err instanceof Error && err.message.includes("Validation")) {
    return res.status(400).json({
      message: "Ошибка валидации данных при создании товара",
    });
  }

  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Ошибка на сервере";

  return res.status(statusCode).json({ message });
};
