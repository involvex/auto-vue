# Project Overview

This project, `create-autovue`, is a command-line interface (CLI) tool designed to scaffold Vue.js projects. It provides a streamlined way to set up new Vue applications with various configurations and features, including TypeScript, routing, state management (Pinia), and different testing frameworks.

**Key Technologies:**

- **TypeScript:** For type-safe JavaScript development.
- **Vue.js:** The progressive JavaScript framework for building user interfaces.
- **Vite:** A fast build tool that provides an extremely fast development experience.
- **ESLint:** For identifying and reporting on patterns found in ECMAScript/JavaScript code.
- **Prettier:** An opinionated code formatter.
- **Vitest:** A fast unit test framework powered by Vite.

## Readme

read [@Readme](README.md)

# Building and Running

## Installation

To install the dependencies, run:

```bash
npm install
```

## Build

To build the project, use the following command:

```bash
npm run build
```

## Testing

To run the test suite:

```bash
npm run test
```

## Linting

To lint the codebase:

```bash
npm run lint
```

## Formatting

To format the code using Prettier:

```bash
npm run format
```

To check for formatting issues without applying changes:

```bash
npm run format:check
```

# Development Conventions

## Code Style and Formatting

- **ESLint:** The project uses ESLint for code quality and style enforcement. The configuration is defined in `eslint.config.js`.
- **Prettier:** Code formatting is handled by Prettier, configured via `.prettierrc`. Developers should run `npm run format` regularly to ensure consistent code style.

## Type Checking

- **TypeScript:** The project is written in TypeScript, and type checking is performed using `tsconfig.json`.

## Testing

- **Vitest:** Unit tests are written using Vitest. Test files are typically located in `__test__` directories or alongside the code they test, following the `*.spec.ts` naming convention.

## Git Commit

Before committing, always run:

- `npx eslint .`
- `npx prettier . --check`
  If either returns errors, adjust the code and rerun the cycle. Once no errors are returned, the changes are ready to be committed.
