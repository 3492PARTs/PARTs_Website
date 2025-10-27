import { Injectable } from '@angular/core';
import { Observable, of, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

/** Result of the “are we inside the allowed area?” check */
export interface LocationCheckResult {
  /** true when the user is inside the permitted radius */
  isAllowed: boolean;
  /** Friendly error message (empty string when allowed) */
  errorMessage: string;
}

/** Result that carries the raw coordinates */
export interface LocationCoordinatesResult {
  /** true when the browser successfully supplied a position */
  success: boolean;
  /** Latitude in decimal degrees (null when !success) */
  latitude: number | null;
  /** Longitude in decimal degrees (null when !success) */
  longitude: number | null;
  /** Optional human‑readable error (empty when success) */
  errorMessage: string;
}

/**
 * Centralised service for everything geolocation‑related.
 *
 * This service implements a fallback strategy: it first tries to use the
 * precise **Browser Geolocation API**. If that fails (e.g., permission denied,
 * timeout), it falls back to the less precise **IP Geolocation lookup**.
 *
 * - `getCurrentLocation()`  → raw coordinates (or an error) using fallback logic
 * - `checkLocation()`       → “inside radius?” boolean + error message
 */
@Injectable({
  providedIn: 'root' // singleton – no need to list in providers[]
})
export class LocationService {
  /** -------------------------------------------------------------
   *  Configuration – edit these once to change the allowed zone
   *  ---------------------------------------------------------- */
  private readonly targetLat = 38.5352373;   // Example: Winfield Middle School
  private readonly targetLng = -81.8890643;
  private readonly allowedRadius = 5000 * 2; // metres (5 km)

  /** -------------------------------------------------------------
   *  PUBLIC API
   *  ---------------------------------------------------------- */

  /**
   * Primary method to get the user's location, implementing the fallback logic.
   *
   * 1. Attempts to get the location using `getBrowserLocation()`.
   * 2. If browser location fails (`success: false`), it falls back to `getIpLocation()`.
   * 3. If both methods fail, it emits the final failure result.
   */
  public getCurrentLocation(): Observable<LocationCoordinatesResult> {
    return this.getIpLocation();
    // 1. Attempt Browser Geolocation first (more precise)
    return this.getBrowserLocation().pipe(
      // Use switchMap to check the result and potentially switch to the fallback Observable
      switchMap(browserRes => {
        if (browserRes.success) {
          // Browser geolocation succeeded, return result immediately
          return of(browserRes);
        }

        // 2. Browser geolocation failed, fall back to IP lookup
        console.warn('Browser Geolocation failed. Attempting IP lookup fallback:', browserRes.errorMessage);
        return this.getIpLocation();
      })
    );
  }

  /**
   * Checks whether the user is inside the configured radius using the
   * full fallback logic from `getCurrentLocation()`.
   *
   * @param latLang Optional custom target latitude and longitude to check against.
   */
  public checkLocation(latLang?: { latitude: number, longitude: number }): Observable<LocationCheckResult> {
    return this.getCurrentLocation().pipe(
      map(coordRes => {
        if (!coordRes.success) {
          // Propagate the error from getCurrentLocation() (both browser and IP failed)
          return {
            isAllowed: false,
            errorMessage: coordRes.errorMessage
          };
        }

        let targetLat = this.targetLat;
        let targetLng = this.targetLng;

        if (latLang) {
          targetLat = latLang.latitude;
          targetLng = latLang.longitude;
        }

        // We have valid latitude/longitude – evaluate distance
        const distance = this.haversineDistance(
          coordRes.latitude as number,
          coordRes.longitude as number,
          targetLat,
          targetLng
        );

        if (distance <= this.allowedRadius) {
          return { isAllowed: true, errorMessage: '' };
        }

        const km = (this.allowedRadius / 1000).toFixed(1);
        return {
          isAllowed: false,
          errorMessage: `You must be within ${km} km of the permitted location.`
        };
      })
    );
  }

  /** -------------------------------------------------------------
   *  BROWSER GEOLOCATION (Native API)
   *  ---------------------------------------------------------- */

  /**
   * Returns the user’s current location as raw coordinates using the browser's API.
   * This is precise but prone to permission errors.
   */
  private getBrowserLocation(): Observable<LocationCoordinatesResult> {
    if (!navigator.geolocation) {
      return of({
        success: false,
        latitude: null,
        longitude: null,
        errorMessage: 'Geolocation is not supported by this browser.'
      });
    }

    // Wrap the native callback API in an Observable
    const position$ = new Observable<GeolocationPosition>(observer => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          observer.next(pos);
          observer.complete();
        },
        err => observer.error(err),
        { timeout: 10000, maximumAge: 60000 }
      );
    });

    return position$.pipe(
      map(pos => ({
        success: true,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        errorMessage: 'Location derived from Browser API.'
      })),
      catchError(err => of(this.handleLocationErrorForCoords(err)))
    );
  }

  /** -------------------------------------------------------------
   *  IP GEOLOCATION (Fallback API)
   *  ---------------------------------------------------------- */

  /**
   * Fetches the approximate user location based on their IP address.
   * This is less precise but almost always works.
   */
  private getIpLocation(): Observable<LocationCoordinatesResult> {
    // NOTE: This simulates an Angular HttpClient call using fetch wrapped in 'from'.
    const ipApiUrl = 'https://ipapi.co/json/';

    return from(fetch(ipApiUrl)).pipe(
      switchMap(response => {
        if (!response.ok) {
          // If the network request fails, throw an error to be caught below
          throw new Error('IP API Network response was not OK.');
        }
        return from(response.json());
      }),
      map((data: any) => {
        if (!data.latitude || !data.longitude) {
          throw new Error('IP API returned invalid coordinates.');
        }
        return {
          success: true,
          latitude: data.latitude,
          longitude: data.longitude,
          errorMessage: 'Location derived from IP address.'
        };
      }),
      catchError(error => {
        // Handle API failures or parsing errors
        console.error('IP Geolocation failed:', error);
        return of({
          success: false,
          latitude: null,
          longitude: null,
          errorMessage: 'IP Geolocation lookup failed. Try enabling browser location services.'
        });
      })
    );
  }

  /** -------------------------------------------------------------
   *  PRIVATE HELPERS
   *  ---------------------------------------------------------- */

  /** Normalise a native PositionError into our coordinate‑result shape err: PositionError*/
  private handleLocationErrorForCoords(err: any): LocationCoordinatesResult {
    let msg = 'An unknown error occurred while fetching location.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        msg = 'Location permission denied by user.';
        break;
      case err.POSITION_UNAVAILABLE:
        msg = 'Unable to determine your precise location.';
        break;
      case err.TIMEOUT:
        msg = 'Location request timed out.';
        break;
    }
    return {
      success: false,
      latitude: null,
      longitude: null,
      errorMessage: msg
    };
  }

  /** Haversine formula – distance in metres between two lat/lng pairs */
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371e3; // Earth radius in metres

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
