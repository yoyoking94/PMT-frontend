import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from './services/auth/auth';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './app';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterOutlet],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should load username from localStorage on init', () => {
    const userData = { user: { username: 'testUser' } };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    component.ngOnInit();
    expect(component.nom).toBe('testUser');
  });

  it('should set nom to null if localStorage item is invalid JSON', () => {
    localStorage.setItem('currentUser', 'invalid json');
    component.ngOnInit();
    expect(component.nom).toBeNull();
  });

  it('should clear nom and call logout on logout', () => {
    component.nom = 'testUser';
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(component.nom).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
