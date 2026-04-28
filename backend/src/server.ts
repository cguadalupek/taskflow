import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

app.listen(env.APP_PORT, () => {
  logger.info(`TaskFlow Pro backend listening on port ${env.APP_PORT}`);
});
