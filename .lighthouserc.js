/**
 * Lighthouse CI configuration
 * Thresholds aligned with .performance-budget.json and Shopify Theme Store requirements.
 */
module.exports = {
  ci: {
    collect: {
      url: [process.env.LIGHTHOUSE_URL || 'http://localhost:9292'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
