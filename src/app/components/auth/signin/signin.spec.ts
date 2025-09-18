import { TestBed } from '@angular/core/testing';
import { SigninComponent } from './signin';
import { AuthService } from '../../../services/auth/auth';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: any;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signin', 'setLoggedUsername']);

    await TestBed.configureTestingModule({
      imports: [SigninComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({})) }, // Mock vide si pas de params nécessaires
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.signin on submit and navigate on success', () => {
    const mockResponse = { username: 'testuser', id: 1 };
    authServiceSpy.signin.and.returnValue(of(mockResponse));

    component.email = 'email@test.com';
    component.password = 'pass123';
    component.onSubmit();

    expect(authServiceSpy.signin).toHaveBeenCalledWith({
      email: 'email@test.com',
      password: 'pass123',
    });
    expect(authServiceSpy.setLoggedUsername).toHaveBeenCalledWith('testuser');
  });

  it('should set errorMsg when signin fails', () => {
    const errorResponse = { error: { message: 'Erreur' } };
    authServiceSpy.signin.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component.errorMsg).toBe('Erreur');
  });
});
