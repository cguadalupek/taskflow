import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/errorMiddleware";
import { sanitizeRequest } from "./middlewares/sanitizeMiddleware";
import routes from "./routes";
import { logger } from "./utils/logger";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "ok" },
    message: "Servicio disponible",
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
