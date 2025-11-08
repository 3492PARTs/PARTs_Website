/**
 * Environment configuration interface
 */
export interface Environment {
  production: boolean;
  version: string;
  baseUrl: string;
  backupBaseUrl: string;
  tokenString: string;
  loggedInHereBefore: string;
  userSettings: string;
  rememberMe: string;
  environment: string;
}

/**
 * Feature flags interface for environment-specific features
 */
export interface FeatureFlags {
  enableOfflineMode?: boolean;
  enableServiceWorker?: boolean;
  enableAnalytics?: boolean;
  enableDebugMode?: boolean;
}
