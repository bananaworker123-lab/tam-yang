import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load the monorepo-root .env before any module reads process.env.
// Import this FIRST in main.ts so env vars are available at module-eval time.
const candidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
  resolve(__dirname, '../../../.env'),
];
for (const p of candidates) {
  if (existsSync(p)) {
    config({ path: p });
    break;
  }
}
