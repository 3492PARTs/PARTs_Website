import { Injectable } from '@angular/core';

// Utility service for building absolute URLs to app endpoints, for encoding into QR codes.
@Injectable({
    providedIn: 'root'
})
export class QrCodeService {

    // Builds an absolute URL to the given app path (e.g. 'resources/team/checkout'), with optional query params.
    buildEndpointUrl(path: string, params?: Record<string, string | number>): string {
        const url = new URL(path.replace(/^\//, ''), window.location.origin + '/');

        if (params) {
            Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
        }

        return url.toString();
    }
}
