import { HttpRequest, HttpHandlerFn, HttpEvent, HttpEventType, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, filter, finalize, Observable, switchMap, take, tap } from "rxjs";
import { AuthService, Token } from "../services/auth.service";
import { GeneralService } from "../services/general.service";

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const auth = inject(AuthService);
    const gs = inject(GeneralService);

    return next(req).pipe(tap(event => {
        console.log('------------------------------------');
        console.log(req);
        console.log(event);
        if (event.type === HttpEventType.Response) {
            gs.devConsoleLog('error.interceptor.ts', `${req.url} returned a response with status ${event.status}`);



            const user = auth.getUser();

            if ([401, 403].includes(event.status) && user && user.id) {


                // 401 unauthorized, try to refresh the token

                if (!auth.getRefreshingTokenFlag()) {
                    auth.setRefreshingTokenFlag(true);

                    // Reset here so that the following requests wait until the token
                    // comes back from the refreshToken call.
                    auth.setToken(null);

                    auth.pipeRefreshToken().pipe(
                        switchMap((token: Token) => {
                            if (token) {
                                auth.setToken(token);
                                return next(addTokenToRequest(req, token.access));
                            }

                            return auth.logOut() as any;
                        }),
                        catchError(rfshErr => {
                            return auth.token.pipe(filter(t1 => t1 != null), take(1), switchMap(t2 => {
                                return next(addTokenToRequest(req, auth.getAccessToken()));
                            }));
                        }),
                        finalize(() => {
                            auth.setRefreshingTokenFlag(false);
                        })
                    );
                } else {
                    auth.token.pipe(filter(t1 => t1 != null), take(1), switchMap(t2 => {
                        return next(addTokenToRequest(req, auth.getAccessToken()));
                    }));
                }

            }
            else if ([400, 403].includes(event.status) && user && user.id) {
                auth.logOut();
            }

            //const error = (err && err.error && err.error.message) || err.statusText;
            //console.error(err);
            //throwError(() => event);
        }
    }));
}

function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}