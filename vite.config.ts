/// <reference types="vitest/config" />
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Uploads source maps so Sentry stack traces point at real source lines
    // instead of minified output (#95). Only present in builds that carry
    // Sentry credentials (e.g. the Vercel production build) — must stay
    // last in the plugins array per the Sentry plugin's own docs, since it
    // needs to see the final build output.
    !!process.env.SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        // Upload, then delete from the build output — a source map is
        // effectively the app's original source, so it must reach Sentry
        // but never ship to a visitor.
        sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] },
      }),
  ],
  build: {
    // Real stack traces for Sentry (#95) instead of minified-and-mangled
    // ones. Without Sentry credentials (see the plugin above), these still
    // get generated and shipped — a locally-run `npm run build` isn't
    // wired to strip them, only the credentialed CI/production build is.
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/main.tsx'],
    },
  },
});
