import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HomeComponent } from '../../components/home/home';
import { ProjectService, Projet } from './projet';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProjectService via HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;

  const dummyProject: Projet = {
    id: 1,
    nom: 'Projet Test',
    createurId: 1,
    description: 'Description du projet',
    dateDebut: '2025-01-01',
    priorite: 'moyenne',
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', [
      'getMyProjects',
      'getAllProjects',
      'createProject',
    ]);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, ReactiveFormsModule, FormsModule, RouterTestingModule],
      providers: [{ provide: ProjectService, useValue: projectServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should load projects on init', () => {
    projectServiceSpy.getMyProjects.and.returnValue(of([dummyProject]));
    projectServiceSpy.getAllProjects.and.returnValue(of([dummyProject]));
  
    fixture.detectChanges();
  
    expect(projectServiceSpy.getMyProjects).toHaveBeenCalled();
    expect(projectServiceSpy.getAllProjects).toHaveBeenCalled();
  });
  

  it('should create a project and reload lists', () => {
    projectServiceSpy.getMyProjects.and.returnValue(of([]));
    projectServiceSpy.getAllProjects.and.returnValue(of([]));
    projectServiceSpy.createProject.and.returnValue(of(dummyProject));

    fixture.detectChanges(); // ngOnInit

    component.createForm.setValue({
      nom: 'Nouveau projet',
      description: 'Desc',
      dateDebut: '2025-01-01',
    });

    component.onSubmitCreate();

    expect(projectServiceSpy.createProject).toHaveBeenCalled();
    expect(projectServiceSpy.getMyProjects).toHaveBeenCalledTimes(2);
    expect(projectServiceSpy.getAllProjects).toHaveBeenCalledTimes(2);
  });
});
