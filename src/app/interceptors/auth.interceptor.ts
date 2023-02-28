import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient } from '@angular/common/http';
import { firstValueFrom, from, lastValueFrom, mergeMap, Observable, switchMap } from 'rxjs';
import * as DeviceDetector from 'device-detector-js';
import * as BotDetector from 'device-detector-js/dist/parsers/bot';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    device: any;

    constructor(private http: HttpClient) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.deviceHandler(request, next));
    }

    async deviceHandler(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
        let authRequest = request.clone();

        if (request.url.startsWith('/')) { // intercept only requests to the server
            if (!this.device) {
                let jsonip: any = await lastValueFrom(this.http.get('https://jsonip.com'));

                const deviceDetector = new DeviceDetector();
                const botDetector = new BotDetector();

                let deviceDetection = deviceDetector.parse(window.navigator.userAgent);
                let botDetection = botDetector.parse(window.navigator.userAgent);

                this.device = {
                    client: deviceDetection?.client?.name,
                    os: deviceDetection?.os?.name,
                    brand: deviceDetection?.device?.brand,
                    model: deviceDetection?.device?.model,
                    type: deviceDetection?.device?.type,
                    bot: botDetection != null,
                    ip: jsonip?.ip
                };

                console.log(this.device);
            }

            authRequest = request.clone({
                headers: request.headers.set('Device', JSON.stringify(this.device)) //add device to request
            });
        }

        return lastValueFrom(next.handle(authRequest));
    }
}
