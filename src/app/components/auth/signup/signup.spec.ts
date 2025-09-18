import { TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup';
import { AuthService } from '../../../services/auth/auth';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: any;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({})) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set success message on successful signup', () => {
    authServiceSpy.signup.and.returnValue(of({ message: 'Inscription réussie' }));
    component.username = 'user1';
    component.email = 'user1@example.com';
    component.password = 'password123';

    component.onSubmit();

    expect(authServiceSpy.signup).toHaveBeenCalledWith({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123',
    });
    expect(component.message).toBe('Inscription réussie ! Vous pouvez vous connecter.');
  });

  it('should set error message on signup failure', () => {
    const errorResponse = { error: { message: 'Email déjà utilisé' } };
    authServiceSpy.signup.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component.message).toBe('Email déjà utilisé');
  });
});
