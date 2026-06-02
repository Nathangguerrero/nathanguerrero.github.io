// ESLint flat config (ESLint 9+).
// Opcional — para uso futuro. Rode com: npm run lint
//
// Cobre o JS-fonte do site (assets/js) e o Worker. Os arquivos .min são ignorados.

export default [
  {
    ignores: [
      'assets/**/*.min.js',
      'dist/**',
      'node_modules/**',
      'src/**', // código legado não usado em produção
    ],
  },
  {
    files: ['assets/js/analytics.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module', // ES module para Vercel Analytics
    },
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
    },
  },
  {
    files: ['assets/js/**/*.js'],
    ignores: ['assets/js/analytics.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script', // IIFEs no escopo global, não módulos
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        IntersectionObserver: 'readonly',
        Image: 'readonly',
        fetch: 'readonly',
        getComputedStyle: 'readonly',
        // Libs externas carregadas via <script>
        Lenis: 'readonly',
        gtag: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'off', // alguns blocos legados usam var intencionalmente
      eqeqeq: ['warn', 'smart'],
      'no-console': 'off',
    },
  },
  {
    files: ['worker/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      eqeqeq: ['error', 'always'],
    },
  },
];
