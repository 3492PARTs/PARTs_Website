import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { environment } from "../../environments/environment";
import { GeneralService } from "../services/general.service";
import { AuthService } from "../services/auth.service";
import { Observable } from "rxjs";

export function httpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const gs = inject(GeneralService);
    const auth = inject(AuthService);

    const token = auth.getAccessToken();
    const user = auth.getUser();

    const baseURL = environment.baseUrl;


    if (req.url.includes('./assets')) { // this is for the icons used on the front end
        gs.devConsoleLog('http.interceptor.ts', 'if: assets');
        return next(req);
    }
    else if (req.url.includes('user/token/refresh/')) {
        gs.devConsoleLog('http.interceptor.ts', 'else if: refresh');
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

    return next(req);
}