import {HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import {from, Observable} from 'rxjs';
import {Router} from "@angular/router";
import {SessionManagerService} from "./session-manager.service";

@Injectable()
export class CustomHttpInterceptor implements CustomHttpInterceptor {

  constructor(public router: Router, private injector: Injector, private sessionManager: SessionManagerService ) {
    setTimeout(() => {
      this.sessionManager = this.injector.get(SessionManagerService);
    }, 1);
  }

  /**
   * intercept interceptor to refresh token and errors control
   * @param request request to send
   * @param next next request step
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const skipIntercept = request.headers.has('skip');
    request = request.clone({
      headers: request.headers.delete('skip')
    });
    if (skipIntercept || request.url.includes("openstreetmap") || request.url.includes("hereapi") || request.url.includes("geoserver") || request.url.includes(".json")) {
      return next.handle(request);
    }
    return from(this.validateToken(request, next));
  }
  /**
   * handle validate refresh token and clone request with new access token
   * @param req request to send
   * @param next next request step
   */
   public async validateToken(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    try {
      if(req.url.includes("8446")){
        let headers = req.headers.append('Authorization',  "3020D4:0DD-2F413E82B-A1EF04559-78CA");
        headers = headers.append('Auth2',  this.sessionManager.returnToken());

        req = req.clone({
          headers
        });
      }else{
        const headers = req.headers.append('Authorization',  this.sessionManager.returnToken());
        req = req.clone({
          headers
        });
      }
      return await next.handle(req).toPromise();
    } catch (error: any) {
      throw error;
    }
  }
}
