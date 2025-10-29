import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { environment } from "../../environments/environment";
import { GeneralService } from "../services/general.service";
import { AuthService, Token } from "../services/auth.service";
import { catchError, filter, finalize, Observable, switchMap, take, throwError } from "rxjs";

export function httpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const gs = inject(GeneralService);
    const auth = inject(AuthService);

    const token = auth.getAccessToken();
    const user = auth.getUser();

    const baseURL = environment.baseUrl;


    if (req.url.includes('user/token/refresh/')) {
        gs.devConsoleLog('http.interceptor.ts', 'if: refresh');
        req = req.clone({
            url: baseURL + req.url,
        });
    }
    else if (user && token && token && !auth.isTokenExpired(token)) {
        gs.devConsoleLog('http.interceptor.ts', `has access token: ${req.url}`);
        req = req.clone({
            url: baseURL + req.url,
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }
    else {
        gs.devConsoleLog('http.interceptor.ts', `else: ${req.url}`);
        let withCredentials = req.url.includes('user/token/refresh/');
        //console.log(req.url, withCredentials);
        req = req.clone({
            url: baseURL + req.url,
            //withCredentials: withCredentials,
        });
    }

    return next(req).pipe(catchError((err) => {
        if ([401, 403].includes(err.status) && user && user.id) {
            // 401 unauthorized, try to refresh the token

            if (!auth.getRefreshingTokenFlag()) {
                auth.setRefreshingTokenFlag(true);

                // Reset here so that the following requests wait until the token
                // comes back from the refreshToken call.
                auth.setRefreshingTokenSubject(null);

                return auth.pipeRefreshToken().pipe(
                    switchMap((token: Token) => {
                        if (token) {
                            auth.setToken(token);
                            auth.setRefreshingTokenSubject(token.access);
                            return next(addTokenToRequest(req, token.access));
                        }

                        auth.logOut() as any;
                        return throwError(() => err);
                    }),
                    catchError(rfshErr => {
                        return auth.refreshingTokenSubject.pipe(filter(t1 => t1 != null), take(1), switchMap(t2 => {
                            return next(addTokenToRequest(req, auth.getAccessToken()));
                        }));
                    }),
                    finalize(() => {
                        auth.setRefreshingTokenFlag(false);
                    })
                );
            } else {
                return auth.refreshingTokenSubject.pipe(filter(t1 => t1 != null), take(1), switchMap(t2 => {
                    return next(addTokenToRequest(req, auth.getAccessToken()));
                }));
            }

        }
        else if ([400, 403].includes(err.status) && user && user.id) {
            auth.logOut();
        }

        //const error = (err && err.error && err.error.message) || err.statusText;
        //console.error(err);
        return throwError(() => err);
    }));
}

function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}