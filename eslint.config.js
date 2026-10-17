'use strict';

const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'commonjs'
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        describe: 'readonly',
        it: 'readonly'
      }
    }
  }
];
