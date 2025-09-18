import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { ProjectService, Project } from '../../services/project/project';
import { AuthService } from '../../services/auth/auth';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjects']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      username$: of('testuser'),
    });

    // Mock getProjects to return an observable, preventing undefined subscribe
    projectServiceSpy.getProjects.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should set username from authService on init', () => {
    component.ngOnInit();
    expect(component.username).toBe('testuser');
  });

  it('projects array is empty initially', () => {
    expect(component.projects.length).toBe(0);
  });
});
