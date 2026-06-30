import { createApp } from './app.js';
import { env } from './shared/config/env.js';

async function main() {
  const app = await createApp();
  app.listen(env.port, () => {
    console.log(`API server running on http://localhost:${env.port}`);
  });
}

main().catch(console.error);
