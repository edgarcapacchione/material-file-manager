import { Injectable, signal } from '@angular/core';

export interface AuthenticatedUser {
  subject: string;
  name: string;
  email: string | null;
  picture: string | null;
  provider: string;
}

export type AuthenticationStatus =
  'loading' | 'authenticated' | 'anonymous' | 'unavailable';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  private readonly userSignal = signal<AuthenticatedUser | null>(null);
  private readonly statusSignal = signal<AuthenticationStatus>('loading');

  readonly user = this.userSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();

  setAuthenticated(user: AuthenticatedUser): void {
    this.userSignal.set(user);
    this.statusSignal.set('authenticated');
  }

  setAnonymous(): void {
    this.userSignal.set(null);
    this.statusSignal.set('anonymous');
  }

  setUnavailable(): void {
    this.userSignal.set(null);
    this.statusSignal.set('unavailable');
  }

  isAuthenticated(): boolean {
    return this.statusSignal() === 'authenticated';
  }
}
