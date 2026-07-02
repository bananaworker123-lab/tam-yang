/**
 * Bundle NestJS dist/ into a single file to reduce cold-start require() overhead.
 * Runs after `nest build` as part of the build script.
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [join(__dirname, 'dist/app.module.js')],
  bundle: true,
  outfile: join(__dirname, 'dist/app.module.bundle.js'),
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  // Keep NestJS decorator metadata intact
  keepNames: true,
  // Externalize native addons and heavy optional deps
  external: [
    // Prisma native client — must load from filesystem
    '@prisma/client',
    '../../prisma-client',
    '../prisma-client',
    './prisma-client',
    // NestJS framework (already in node_modules, no benefit bundling)
    '@nestjs/core',
    '@nestjs/common',
    '@nestjs/platform-express',
    '@nestjs/passport',
    // Passport & auth
    'passport',
    'passport-google-oauth20',
    // Express
    'express',
    // Reflect metadata (must be singleton)
    'reflect-metadata',
    // Node built-ins
    'crypto', 'path', 'fs', 'os', 'http', 'https', 'net', 'tls', 'stream',
    'events', 'util', 'url', 'zlib', 'buffer', 'querystring', 'assert',
  ],
  logLevel: 'info',
});

console.log('✓ Bundle complete: dist/app.module.bundle.js');
