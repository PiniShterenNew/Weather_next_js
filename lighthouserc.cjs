// lighthouserc.cjs - CommonJS format
module.exports = {
    ci: {
      collect: {
        url: ['http://localhost:3000/en'],
        startServerCommand: 'next start',
        startServerReadyPattern: 'ready started server on',
        startServerReadyTimeout: 60000, // 60 seconds
        numberOfRuns: 1,
      },
      upload: {
        target: 'temporary-public-storage',
      },
      assert: {
        preset: 'lighthouse:recommended',
        assertions: {
          'categories:performance': ['error', { minScore: 0.8 }],
          'categories:accessibility': ['error', { minScore: 0.9 }],
          'categories:best-practices': ['error', { minScore: 0.9 }],
          'categories:seo': ['error', { minScore: 0.9 }],
        },
      },
    },
  };
