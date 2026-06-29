// ─── Server Entry Point ─────────────────────────────────────────────────────
import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const app = createApp();

app.listen(config.port, () => {
  logger.info(`🚀 BRSR SRMM Server running on http://localhost:${config.port}`);
  logger.info(`📋 Health: http://localhost:${config.port}/api/health`);
});
