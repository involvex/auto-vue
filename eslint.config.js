import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'bin/',
      'node_modules/',
      'bundle.js',
      '*.config.js',
      '*.config.ts',
      '.eslintrc.cjs',
      'playground/**/*',
      'scripts/**/*',
      'template/**/*',
      'docs/**/*',
      '.github/**/*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  },
)
