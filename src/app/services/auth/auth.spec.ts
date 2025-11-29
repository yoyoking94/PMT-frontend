import { AuthService } from './auth';

class FakeAuthService extends AuthService {
  // On ne passe pas de HttpClient, on le remplace par null
  constructor() {
    super(null as any);
  }
}

describe('AuthService (sans HTTP)', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new FakeAuthService();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be not authenticated by default', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should store user on loginSuccess and report authenticated', () => {
    const userData = { user: { id: 1, email: 'test@example.com', roles: ['user'] } };

    service.loginSuccess(userData);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getCurrentUserId()).toBe(1);
  });

  it('should detect admin role', () => {
    const userData = { user: { id: 2, email: 'admin@example.com', roles: ['admin'] } };

    service.loginSuccess(userData);

    expect(service.isAdmin()).toBeTrue();
  });

  it('should return false for isAdmin when no user', () => {
    expect(service.isAdmin()).toBeFalse();
  });

  it('should logout and clear authentication', () => {
    localStorage.setItem('currentUser', JSON.stringify({ user: { id: 3 } }));

    expect(service.isAuthenticated()).toBeTrue();

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getCurrentUserId()).toBeNull();
  });
});
