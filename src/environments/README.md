# Environment Configuration

This directory contains environment-specific configuration files for the Angular application.

## Files

- `environment.interface.ts` - TypeScript interface defining the structure of environment configurations
- `environment.ts` - Production environment configuration
- `environment.development.ts` - Development environment configuration
- `environment.uat.ts` - UAT (User Acceptance Testing) environment configuration

## Usage

The appropriate environment file is automatically selected based on the build configuration:

```bash
# Development build (uses environment.development.ts)
npm start
ng serve

# Production build (uses environment.ts)
npm run build
ng build --configuration production

# UAT build (uses environment.uat.ts)
ng build --configuration uat
```

## Environment Interface

All environment files must implement the `Environment` interface:

```typescript
interface Environment {
  production: boolean;        // Whether this is a production build
  version: string;           // Version identifier
  baseUrl: string;          // Primary API base URL
  backupBaseUrl: string;    // Backup API base URL
  tokenString: string;      // Token storage key
  loggedInHereBefore: string; // Login history key
  userSettings: string;     // User settings storage key
  rememberMe: string;       // Remember me token key
  environment: string;      // Environment name
}
```

## Adding a New Environment

1. Create a new file: `environment.{name}.ts`
2. Implement the `Environment` interface
3. Add configuration to `angular.json`:

```json
"configurations": {
  "{name}": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.{name}.ts"
      }
    ]
  }
}
```

## Best Practices

1. **Never commit secrets**: Don't include sensitive data like API keys directly in environment files
2. **Use environment variables**: For CI/CD pipelines, inject values at build time
3. **Type safety**: Always use the `Environment` interface for type safety
4. **Documentation**: Document the purpose of each configuration value
5. **Validation**: Consider adding runtime validation for critical configuration values

## Feature Flags

For feature toggling, use the `FeatureFlags` interface:

```typescript
interface FeatureFlags {
  enableOfflineMode?: boolean;
  enableServiceWorker?: boolean;
  enableAnalytics?: boolean;
  enableDebugMode?: boolean;
}
```

Add feature flags to your environment configuration:

```typescript
export const environment: Environment & { features: FeatureFlags } = {
  // ... other config
  features: {
    enableOfflineMode: true,
    enableServiceWorker: true,
    enableAnalytics: false,
    enableDebugMode: false
  }
};
```
