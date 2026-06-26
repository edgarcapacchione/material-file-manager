import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from './auth-state.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isProtectedApi = request.url.startsWith('/api/')
        && request.url !== '/api/auth/me';
      if (error.status === 401 && isProtectedApi) {
        authState.setAnonymous();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
