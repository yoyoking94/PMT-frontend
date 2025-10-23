import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth';
import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow activation if authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const canActivate = guard.canActivate({} as any, { url: '/some-url' } as any);

    expect(canActivate).toBeTrue();
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login if not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const loginUrlTree = new UrlTree();
    routerSpy.createUrlTree.and.returnValue(loginUrlTree);

    const result = guard.canActivate({} as any, { url: '/some-url' } as any);

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/some-url' } });
    expect(result).toBe(loginUrlTree);
  });
});
