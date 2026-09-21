console.log(">>> STARTING BACKEND...");
console.log(">>> DB_ADDRESS:", process.env.DB_ADDRESS);
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import path from "path";
import errorHandler from "./middlewares/error-handler";
import router from "./routes/index";
import { requestLogger, errorLogger } from "./middlewares/logger";
import NotFoundError from "./errors/not-found-error";

const app = express();
const PORT = 3000;

app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(router);

app.use((_req, _res, next) => {
  next(new NotFoundError("Маршрут не найден"));
});

app.use(errorLogger);
app.use(errorHandler);

app.get("/", (_req, res) => {
  res.json({ message: "Сервер работает!" });
});

const mongoAddress =
  process.env.DB_ADDRESS || "mongodb://root:example@mongo:27017/weblarek";

mongoose
  .connect(mongoAddress)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });
