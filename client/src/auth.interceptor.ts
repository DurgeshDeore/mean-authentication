import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Since you're using httpOnly cookies, we don't need to manually set the token
    // But we can ensure credentials are included for all requests to our API
    if (request.url.includes('/api/auth')) {
      request = request.clone({
        withCredentials: true
      });
    }
    return next.handle(request);
  }
}   