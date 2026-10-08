# PARTs Website

Team 3492's official website for scouting, team management, and public information.

This project uses Angular 22 and [Angular CLI](https://github.com/angular/angular-cli) 22.

## Angular 22 Upgrade Notes

- Use Node.js `^22.22.3`, `^24.15.0`, or `>=26.0.0` and TypeScript `>=6.0 <6.1`. The Docker build stage uses Node.js 24.
- Existing components explicitly use `ChangeDetectionStrategy.Eager` to preserve the pre-upgrade change-detection behavior. Angular 22 defaults new components to `OnPush`; choose a strategy intentionally when generating or editing components.
- `provideHttpClient()` uses `withXhr()` to keep the app's XMLHttpRequest backend behavior.
- The event-competition template uses `$safeNavigationMigration()` around optional-chain expressions where the old `null` result must be preserved. Keep this wrapper when editing those expressions unless you have verified the changed `undefined` behavior is safe.
- `tsconfig.app.json` and `tsconfig.spec.json` suppress the `nullishCoalescingNotNullable` and `optionalChainNotNullable` extended diagnostics. These were added by the migration; remove the suppressions after reviewing and fixing those diagnostics.
- TypeScript 6 deprecates `baseUrl`; it was removed from `tsconfig.json`, and path aliases are now explicitly relative to that config.
- The app had no Angular animation triggers, so the deprecated `@angular/animations` and unused `@angular/platform-browser-dynamic` packages were removed. If Angular animations are added later, prefer Angular's CSS-based `animate.enter`/`animate.leave` APIs.
- Karma remains the test runner. `istanbul-lib-instrument` was added for its coverage support. The optional Angular CLI migration to Vitest was not run.
- The app already uses the `@angular/build:application` builder, so no build-system migration or extra build flags were needed.

After upgrading, use `npm ci` to install the versions pinned by `package-lock.json`.

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Architecture](./docs/architecture/)** - Application structure, design patterns, and best practices
- **[Development](./docs/development/)** - Contributing guide, testing, and development workflow
- **[Deployment](./docs/deployment/)** - Docker builds, CI/CD pipeline, and deployment instructions

### Quick Links
- [Contributing Guide](./docs/development/CONTRIBUTING.md) - Start here for contributing
- [Angular Best Practices](./docs/architecture/ANGULAR_BEST_PRACTICES.md) - Coding standards
- [Domain Structure](./docs/architecture/DOMAIN_STRUCTURE.md) - Project organization
- [Testing Guide](./docs/development/TESTING.md) - Running and writing tests
- [Dockerfile Usage](./docs/deployment/DOCKERFILE_USAGE.md) - Docker build instructions

## 🏗️ Architecture

This project follows Angular best practices with a **domain-driven architecture**:
- Domain/feature-based folder structure
- Barrel exports for cleaner imports
- ESLint and Prettier for code quality
- TypeScript strict mode
- Standalone components (Angular 14+)
- Lazy-loaded routes for optimal performance

See [docs/architecture/](./docs/architecture/) for detailed architecture documentation.

## 🚀 Quick Start

### Development Server
```bash
npm install
npm start
```
Navigate to `http://localhost:4200/`. The application will automatically reload when you change source files.

### Code Quality
```bash
# Lint your code
npm run lint
npm run lint:fix

# Format your code
npm run format:check
npm run format
```

### Testing
```bash
# Run tests interactively
npm test

# Run tests once (CI mode)
npm run test:ci

# Generate coverage report
npm run test:coverage
```

See [Testing Guide](./docs/development/TESTING.md) for detailed testing documentation.

## 🐳 Docker Builds

This project uses a unified Dockerfile with build arguments for different environments.

### Production Build (Python runtime)
```bash
docker build --build-arg BUILD_CONFIGURATION=production --target runtime-production -t parts-website:prod .
```

### UAT Build (Nginx runtime)
```bash
docker build --build-arg BUILD_CONFIGURATION=uat --target runtime-uat -t parts-website:uat .
```

For detailed Docker and deployment documentation, see [docs/deployment/](./docs/deployment/).

## 🔧 Additional Commands

### Build
```bash
npm run build  # Production build
```
Build artifacts will be stored in the `dist/` directory.

### Code Scaffolding
```bash
ng generate component component-name
```
You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### End-to-End Tests
```bash
npm run e2e
```
Note: You need to first add a package that implements end-to-end testing capabilities.

## 📖 Learn More

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Angular Style Guide](https://angular.dev/style-guide)
- [Project Documentation](./docs/)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./docs/development/CONTRIBUTING.md) to get started.

Before submitting a pull request:
1. Run `npm run lint:fix` to fix linting issues
2. Run `npm run format` to format code
3. Run `npm test` to ensure tests pass
4. Follow our [Angular Best Practices](./docs/architecture/ANGULAR_BEST_PRACTICES.md)

## 📄 License

[License information here]
