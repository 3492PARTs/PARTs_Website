import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
 * - `getCurrentLocation()` → raw coordinates (or an error)
 * - `checkLocation()`       → “inside radius?” boolean + error message
 *
 * Both methods return **Observables**, which makes them easy to compose
 * with other RxJS pipelines (retry, combineLatest, etc.).
 */
@Injectable({
  providedIn: 'root'               // singleton – no need to list in providers[]
})
export class LocationService {
  /** -------------------------------------------------------------
   *  Configuration – edit these once to change the allowed zone
   *  ---------------------------------------------------------- */
  private readonly targetLat = 38.5352373;   // Example: Winfield Middle School
  private readonly targetLng = -81.8890643;
  private readonly allowedRadius = 5000; // metres (1 km)

  /** -------------------------------------------------------------
   *  PUBLIC API
   *  ---------------------------------------------------------- */

  /**
   * Returns the user’s current location as raw coordinates.
   *
   * Emits a single {@link LocationCoordinatesResult} and then completes.
   * If the browser does not support geolocation, or the user denies
   * permission, `success` will be false and `errorMessage` will contain
   * a friendly description.
   */
  public getCurrentLocation(): Observable<LocationCoordinatesResult> {
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
        errorMessage: ''
      })),
      catchError(err => of(this.handleLocationErrorForCoords(err)))
    );
  }

  /**
   * Checks whether the user is inside the configured radius.
   *
   * Internally it calls `getCurrentLocation()` and then runs the
   * distance calculation.  The returned shape matches the original
   * implementation (`GeoCheckResult`).
   */
  public checkLocation(latLang?: { latitude: number, longitude: number }): Observable<LocationCheckResult> {
    return this.getCurrentLocation().pipe(
      map(coordRes => {
        if (!coordRes.success) {
          // Propagate the error from getCurrentLocation()
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
   *  PRIVATE HELPERS
   *  ---------------------------------------------------------- */

  /** Normalise a native PositionError into our coordinate‑result shape err: PositionError*/
  private handleLocationErrorForCoords(err: any): LocationCoordinatesResult {
    let msg = 'An unknown error occurred while fetching location.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        msg = 'Location permission denied.';
        break;
      case err.POSITION_UNAVAILABLE:
        msg = 'Unable to determine your location.';
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