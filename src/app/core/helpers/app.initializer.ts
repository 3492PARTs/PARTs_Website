import { AuthService } from '@app/auth/services/auth.service';

/**
 * Application initializer function
 * 
 * This function is called during application bootstrap to perform initialization tasks
 * before the application starts. Currently, automatic token refresh is disabled but
 * the infrastructure is in place for future use.
 * 
 * @param auth - The authentication service instance
 * @returns A function that returns a Promise which resolves when initialization is complete
 * 
 * @example
 * // In app.config.ts
 * providers: [
 *   {
 *     provide: APP_INITIALIZER,
 *     useFactory: appInitializer,
 *     deps: [AuthService],
 *     multi: true
 *   }
 * ]
 */
export function appInitializer(auth: AuthService) {
  return () => new Promise(resolve => {
    // Immediately resolve - no initialization needed at this time
    // Previously attempted to refresh token on app startup for auto-authentication
    // This is currently disabled but can be re-enabled by uncommenting the code below
    
    /*
    // Auto-refresh token if user was previously authenticated
    auth.refreshToken()
      .subscribe()
      .add(resolve);
    */
    
    resolve(undefined);
  });
}
