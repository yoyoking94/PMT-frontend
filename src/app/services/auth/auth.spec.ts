import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const dummyUser: User = {
    email: 'test@example.com',
    password: '1234',
    username: 'testuser',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register user successfully', () => {
    service.register(dummyUser).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should handle register error', () => {
    const errorMessage = 'Email exists';

    service.register(dummyUser).subscribe({
      next: () => fail('expected error'),
      error: (error) => expect(error.message).toContain(errorMessage),
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    req.flush({ error: errorMessage }, { status: 400, statusText: 'Bad Request' });
  });

  it('should login user successfully', () => {
    service.login(dummyUser).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc123' });
  });

  it('should handle login error', () => {
    const errorMessage = 'Invalid password';

    service.login(dummyUser).subscribe({
      next: () => fail('expected error'),
      error: (error) => expect(error.message).toContain(errorMessage),
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush({ error: errorMessage }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should store user data on loginSuccess', () => {
    const userData = { user: { id: 1, username: 'testuser' } };
    service.loginSuccess(userData);
    expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(userData));
  });

  it('should return user id from localStorage', () => {
    const userData = { user: { id: 42, username: 'foo' } };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    expect(service.getCurrentUserId()).toBe(42);
  });

  it('should clear localStorage on logout', () => {
    service.logout();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('should return user email by id', () => {
    const userId = 1;
    service.getUserById(userId).subscribe((user) => {
      expect(user.email).toBe('user@example.com');
    });

    const req = httpMock.expectOne(`http://localhost:8080/api/utilisateurs/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: userId, email: 'user@example.com' });
  });
});
