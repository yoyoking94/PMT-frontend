import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth';
import { HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const dummyUser: User = {
    email: 'test@example.com',
    username: 'testuser',
    password: '12345',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    service.register(dummyUser).subscribe((res) => {
      expect(res).toEqual({ message: 'User registered' });
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dummyUser);

    req.flush({ message: 'User registered' });
  });

  it('should login a user', () => {
    service.login({ email: dummyUser.email, password: dummyUser.password }).subscribe((res) => {
      expect(res).toEqual({ token: 'abc123' });
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: dummyUser.email, password: dummyUser.password });

    req.flush({ token: 'abc123' });
  });

  it('should return false if not authenticated', () => {
    localStorage.removeItem('currentUser');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return true if authenticated', () => {
    localStorage.setItem('currentUser', JSON.stringify({ user: { id: 1, roles: ['admin'] } }));
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should save data on loginSuccess', () => {
    const userData = { id: 1, email: 'test@example.com' };
    service.loginSuccess(userData);
    expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(userData));
  });

  it('should return current user id', () => {
    const storedUser = { user: { id: 10 } };
    localStorage.setItem('currentUser', JSON.stringify(storedUser));
    expect(service.getCurrentUserId()).toBe(10);
  });

  it('should return null if no current user', () => {
    localStorage.removeItem('currentUser');
    expect(service.getCurrentUserId()).toBeNull();
  });

  it('should get user by id', () => {
    service.getUserById(5).subscribe((user) => {
      expect(user).toEqual({ id: 5, email: 'user5@example.com' });
    });

    const req = httpMock.expectOne('http://localhost:8080/api/utilisateurs/5');
    expect(req.request.method).toBe('GET');

    req.flush({ id: 5, email: 'user5@example.com' });
  });

  it('should detect admin role', () => {
    const userWithAdminRole = { user: { roles: ['admin', 'user'] } };
    localStorage.setItem('currentUser', JSON.stringify(userWithAdminRole));
    expect(service.isAdmin()).toBeTrue();
  });

  it('should detect non-admin role', () => {
    const userWithoutAdminRole = { user: { roles: ['user'] } };
    localStorage.setItem('currentUser', JSON.stringify(userWithoutAdminRole));
    expect(service.isAdmin()).toBeFalse();
  });

  it('should clear localStorage on logout', () => {
    localStorage.setItem('currentUser', JSON.stringify({}));
    service.logout();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});
