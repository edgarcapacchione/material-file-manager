import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthStateService } from './auth-state.service';

describe('AuthStateService', () => {
  let service: AuthStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(AuthStateService);
  });

  it('starts in loading state', () => {
    expect(service.status()).toBe('loading');
    expect(service.user()).toBeNull();
  });

  it('stores and clears an authenticated user', () => {
    service.setAuthenticated({
      subject: 'subject-1',
      name: 'Test User',
      email: 'test@example.com',
      picture: null,
      provider: 'oidc'
    });

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.user()?.email).toBe('test@example.com');

    service.setAnonymous();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
  });
});
