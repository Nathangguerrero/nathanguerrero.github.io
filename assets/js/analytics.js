/* ============================================================================
 * Nathan Guerrero — Portfólio · analytics.js
 * Vercel Web Analytics initialization
 * ==========================================================================*/

import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
inject({
  mode: 'production',
  debug: false
});
