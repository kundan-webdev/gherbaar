import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`API listening on :${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
