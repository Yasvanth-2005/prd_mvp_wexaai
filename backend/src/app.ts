import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";
import { healthRouter } from "./routes/health";

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

export const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);

app.use(errorHandler);
