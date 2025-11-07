/**
 * Shared application constants and configuration values
 */

/**
 * API Status States
 */
export enum ApiStatus {
  Processing = 'prcs',
  Online = 'on',
  Offline = 'off',
}

/**
 * Authentication Call States
 */
export enum AuthCallState {
  Processing = 'prcs',
  Complete = 'comp',
  Failed = 'fail',
}

/**
 * Banner Severity Levels
 */
export enum BannerSeverity {
  High = 1,
  Medium = 2,
  Low = 3,
}

/**
 * Default timeout values (in milliseconds)
 */
export const DEFAULT_TIMEOUTS = {
  BANNER: 5000,
  REQUEST: 30000,
  REMEMBER_ME: 2592000000, // 30 days
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Connection error status codes
 */
export const CONNECTION_ERROR_STATUSES = [0, 504] as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  REMEMBER_ME: 'rememberMe',
} as const;

/**
 * Application routes
 */
export const APP_ROUTES = {
  HOME: '',
  LOGIN: 'login',
  ADMIN: 'admin',
  SCOUTING: 'scouting',
  SCOUTING_ADMIN: 'scouting-admin',
} as const;
