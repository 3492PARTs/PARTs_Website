# Development Documentation

This directory contains guides and resources for developers contributing to the PARTs Website project.

## 📄 Documents

### [Contributing Guide](./CONTRIBUTING.md)
Complete guide for contributors:
- Getting started with the project
- Code standards and style guide
- TypeScript and naming conventions
- Project structure overview
- Adding new features workflow
- Component and service best practices
- Git workflow and branching strategy
- Commit message conventions (Conventional Commits)
- Pull request process and guidelines
- Testing requirements
- Code review checklist

**When to read**: **Start here** if you're new to the project or before making your first contribution.

### [Testing Guide](./TESTING.md)
Comprehensive testing documentation:
- Running tests (interactive and CI modes)
- Generating and viewing coverage reports
- Writing tests for components, services, pipes, directives, guards
- Test helpers and utilities
- CI/CD integration examples
- Best practices and troubleshooting

**When to read**: Before writing or running tests, or when test coverage needs improvement.

### [Test Coverage Progress](./TEST_COVERAGE_PROGRESS.md)
Current state of test coverage:
- Test metrics and statistics
- Work completed on test infrastructure
- Remaining work and priorities
- Architecture decisions for testing
- Known issues and recommendations
- Estimated effort for 100% coverage

**When to read**: When planning testing work or understanding current test status.

## 🚀 Quick Start for Developers

1. **Clone and setup**:
   ```bash
   git clone https://github.com/3492PARTs/PARTs_Website.git
   cd PARTs_Website
   npm install
   ```

2. **Read the guides**:
   - Start with [Contributing Guide](./CONTRIBUTING.md)
   - Review [Architecture Best Practices](../architecture/ANGULAR_BEST_PRACTICES.md)

3. **Development workflow**:
   ```bash
   # Start dev server
   npm start
   
   # Lint your code
   npm run lint
   npm run lint:fix
   
   # Format your code
   npm run format
   
   # Run tests
   npm test
   npm run test:ci
   ```

4. **Before committing**:
   - Run `npm run lint:fix`
   - Run `npm run format`
   - Run `npm test`
   - Ensure all checks pass

## 🔗 Related Documentation

- [Architecture Overview](../architecture/README.md) - Understand the application structure
- [Deployment Guide](../deployment/README.md) - Build and deployment instructions
- [Main README](../../README.md) - Project overview

## 📋 Development Checklist

When adding a new feature:
- [ ] Code follows [Angular Best Practices](../architecture/ANGULAR_BEST_PRACTICES.md)
- [ ] Tests are written and passing
- [ ] Code is linted and formatted
- [ ] Documentation is updated
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] PR description is clear and complete

## 💬 Getting Help

- Check existing documentation first
- Review related code for patterns
- Ask in team communication channels
- Open an issue for clarification
- Reach out to maintainers
