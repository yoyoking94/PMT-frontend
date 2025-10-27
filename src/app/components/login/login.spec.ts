import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService, User } from '../../services/auth/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'loginSuccess', 'register']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create login component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle connexion mode and clear errorMessage', () => {
    component.errorMessage = 'Some error';
    component.connexion = true;
    component.toggleConnexion();
    expect(component.connexion).toBeFalse();
    expect(component.errorMessage).toBeNull();
  });

  it('should submit login successfully and navigate', fakeAsync(() => {
    const user: User = { email: 'test@example.com', password: '1234' };
    authServiceSpy.login.and.returnValue(of(user));
    component.loginForm.setValue(user);

    component.submitLogin();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith(user);
    expect(authServiceSpy.loginSuccess).toHaveBeenCalledWith(user);
    expect(component.errorMessage).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should handle login error', fakeAsync(() => {
    const error = { message: 'Login failed' };
    const user: User = { email: 'fail@example.com', password: 'fail' };
    authServiceSpy.login.and.returnValue(throwError(() => error));
    component.loginForm.setValue(user);

    component.submitLogin();
    tick();

    expect(component.errorMessage).toBe(error.message);
  }));

  it('should submit register successfully and switch to connexion', fakeAsync(() => {
    const user: User = { email: 'new@example.com', username: 'newuser', password: 'pass' };
    authServiceSpy.register.and.returnValue(of({}));
    component.registerForm.setValue(user);

    component.submitRegister();
    tick();

    expect(authServiceSpy.register).toHaveBeenCalledWith(user);
    expect(component.errorMessage).toBeNull();
    expect(component.connexion).toBeTrue();
  }));

  it('should handle register error', fakeAsync(() => {
    const error = { message: 'Register failed' };
    const user: User = { email: 'fail@example.com', username: 'fail', password: 'fail' };
    authServiceSpy.register.and.returnValue(throwError(() => error));
    component.registerForm.setValue(user);

    component.submitRegister();
    tick();

    expect(component.errorMessage).toBe(error.message);
  }));
});
