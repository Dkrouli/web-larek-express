import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import path from "path";
import router from "./routes/index";
import { requestLogger, errorLogger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/error-handler";
import NotFoundError from "./errors/not-found-error";

const app = express();
const PORT = 3000;

app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(router);

app.use((req, res, next) => {
  next(new NotFoundError("Маршрут не найден"));
});

app.use(errorHandler);
app.use(errorLogger);

app.get("/", (req, res) => {
  res.json({ message: "Сервер работает!" });
});

const mongoAddress =
  process.env.DB_ADDRESS || "mongodb://127.0.0.1:27017/weblarek";

mongoose
  .connect(mongoAddress)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });
