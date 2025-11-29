/* import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User } from '../auth/auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const dummyUser: User = {
    email: 'test@example.com',
    username: 'testuser',
    password: '12345'
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

  it('should register a user', () => {
    service.register(dummyUser).subscribe(response => {
      expect(response).toEqual({ message: 'User registered' });
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dummyUser);
    req.flush({ message: 'User registered' });
  });

  it('should handle registration error', () => {
    const errorMsg = { error: { error: 'Failed to register' } };
    service.register(dummyUser).subscribe(
      () => fail('should have failed with error'),
      (error) => {
        expect(error.message).toBe('Failed to register');
      }
    );

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    req.flush({ error: 'Failed to register' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should login a user', () => {
    service.login({ email: dummyUser.email, password: dummyUser.password }).subscribe(response => {
      expect(response).toEqual({ token: 'abc123' });
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: dummyUser.email, password: dummyUser.password });
    req.flush({ token: 'abc123' });
  });

  it('should handle login error', () => {
    const errorMsg = { error: { error: 'Invalid credentials' } };
    service.login({ email: dummyUser.email, password: dummyUser.password }).subscribe(
      () => fail('should have failed with error'),
      (error) => {
        expect(error.message).toBe('Invalid credentials');
      }
    );

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  });
});
 */