import { createApp } from '../server/dist/app.js';

let app: ReturnType<typeof createApp> | undefined;

/** Vercel serverless entry — wraps the Express API. */
export default function handler(req: import('@vercel/node').VercelRequest, res: import('@vercel/node').VercelResponse) {
  if (!app) {
    app = createApp();
  }
  return app(req, res);
}
