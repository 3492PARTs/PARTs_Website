# Architecture Documentation

This directory contains documentation about the PARTs Website application architecture, design patterns, and structural decisions.

## 📄 Documents

### [Angular Best Practices](./ANGULAR_BEST_PRACTICES.md)
Comprehensive guide covering:
- Domain-driven architecture
- Naming conventions (files, classes, variables)
- Code organization and barrel exports
- Import patterns and path aliases
- Component and service guidelines
- State management approaches
- Testing strategies
- Code quality tools (ESLint, Prettier, TypeScript)
- Performance, accessibility, and security best practices

**When to read**: Essential for all developers. Review before starting any new feature.

### [Domain Structure](./DOMAIN_STRUCTURE.md)
Details about the application's domain-based structure:
- Domain/feature-based vs type-based organization
- Complete folder structure explanation
- Description of each domain (core, shared, auth, scouting, admin, etc.)
- Benefits of domain-driven architecture
- Migration guide from old structure
- Guidelines for adding new features

**When to read**: When navigating the codebase or adding new features.

### [Refactoring Summary](./REFACTORING_SUMMARY.md)
Historical record of major refactoring efforts:
- Code quality tooling implementation (ESLint, Prettier)
- Project structure improvements
- Constants and enums centralization
- Environment configuration enhancements
- Documentation creation
- Route configuration updates
- Metrics and impact analysis

**When to read**: For understanding why the codebase is structured the way it is, or when planning major refactoring.

## 🔗 Related Documentation

- [Development Guide](../development/CONTRIBUTING.md) - How to contribute following these architectural patterns
- [Testing Guide](../development/TESTING.md) - Testing strategies aligned with the architecture
- [Main README](../../README.md) - Project overview

## 💡 Key Principles

The architecture follows these key principles:

1. **Domain-Driven Design**: Features are organized by domain/feature rather than by file type
2. **Single Responsibility**: Each module, component, and service has one clear purpose
3. **DRY (Don't Repeat Yourself)**: Shared code in `core/` and `shared/` directories
4. **Type Safety**: TypeScript strict mode with explicit typing
5. **Standalone Components**: Modern Angular standalone components pattern
6. **Lazy Loading**: Feature modules loaded on-demand for performance
7. **Testability**: Code structured for easy unit testing
