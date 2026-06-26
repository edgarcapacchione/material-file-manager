import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthenticatedUser, AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private authState: AuthStateService
  ) {}

  async initialize(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<AuthenticatedUser>('/api/auth/me')
      );
      this.authState.setAuthenticated(user);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.authState.setAnonymous();
      } else {
        this.authState.setUnavailable();
      }
    }
  }

  login(): void {
    window.location.assign('/oauth2/authorization/mfm');
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post<void>('/api/auth/logout', {}));
    this.authState.setAnonymous();
    await this.router.navigate(['/login']);
  }
}
