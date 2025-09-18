import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const fakeSigninResponse = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes en suspens
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform signin and store username', (done) => {
    const signinData = { email: 'test@example.com', password: 'pwd123' };

    service.signin(signinData).subscribe((response) => {
      expect(response).toEqual(fakeSigninResponse);
      expect(service.getLoggedUsername()).toBe(fakeSigninResponse.username);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/signin');
    expect(req.request.method).toBe('POST');
    req.flush(fakeSigninResponse);
  });

  it('should perform signup', (done) => {
    const signupData = { username: 'newuser', email: 'new@example.com', password: 'password' };

    service.signup(signupData).subscribe((response) => {
      expect(response).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/signup');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should set and get logged username', () => {
    service.setLoggedUsername('myuser');
    expect(service.getLoggedUsername()).toBe('myuser');
  });

  it('should logout and clear username', () => {
    service.setLoggedUsername('myuser');
    service.logout();
    expect(service.getLoggedUsername()).toBeNull();
  });
});
