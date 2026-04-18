/**
 * API base URL.
 * - Production (Vercel): empty string — all /api/* calls go through Vercel proxy
 *   which rewrites them to Railway. Zero CORS issues.
 * - Local dev: http://localhost:8000 (or VITE_API_URL override)
 */
export const API = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000');
