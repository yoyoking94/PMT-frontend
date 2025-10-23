import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from './home';
import { ProjectService, Projet } from '../../services/projet/projet';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  const dummyMyProjects: Projet[] = [
    { id: 1, nom: 'Mon Projet 1', createurId: 1, dateDebut: '2025-10-20', priorite: 'moyenne' },
  ];
  const dummyAllProjects: Projet[] = [
    { id: 2, nom: 'Projet Global', createurId: 2, dateDebut: '2025-09-01', priorite: 'faible' },
    { id: 3, nom: 'Un autre projet', createurId: 3, dateDebut: '2025-01-15', priorite: 'haute' },
  ];

  beforeEach(waitForAsync(() => {
    mockProjectService = jasmine.createSpyObj('ProjectService', ['getMyProjects', 'getAllProjects', 'createProject']);

    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [{ provide: ProjectService, useValue: mockProjectService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    mockProjectService.getMyProjects.and.returnValue(of(dummyMyProjects));
    mockProjectService.getAllProjects.and.returnValue(of(dummyAllProjects));

    fixture.detectChanges(); // ngOnInit()
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load my projects on init', () => {
    expect(component.myProjects.length).toBe(1);
    expect(component.myProjects[0].nom).toBe('Mon Projet 1');
  });

  it('should load all projects on init', () => {
    expect(component.allProjects.length).toBe(2);
  });

  it('should filter projects correctly', () => {
    component.filterText = 'global';
    const filtered = component.filteredProjects();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nom).toBe('Projet Global');
  });

  it('should return all projects if filter text is empty', () => {
    component.filterText = '';
    const filtered = component.filteredProjects();
    expect(filtered.length).toBe(dummyAllProjects.length);
  });

  it('should create new project and reload projects', () => {
    mockProjectService.createProject.and.returnValue(of({ id: 99, nom: 'Test Projet', createurId: 1 }));

    component.createForm.setValue({
      nom: 'Test Projet',
      description: 'Une description de test',
      dateDebut: '2025-10-23',
    });

    spyOn(component, 'loadMyProjects').and.callThrough();
    spyOn(component, 'loadAllProjects').and.callThrough();

    component.onSubmitCreate();

    expect(mockProjectService.createProject).toHaveBeenCalled();
    expect(component.loadMyProjects).toHaveBeenCalled();
    expect(component.loadAllProjects).toHaveBeenCalled();
    expect(component.createForm.value.nom).toBeNull(); // form reset after creation
  });

  it('should handle error when creating project', () => {
    mockProjectService.createProject.and.returnValue(throwError(() => new Error('Create error')));

    component.createForm.setValue({
      nom: 'Test Error',
      description: '',
      dateDebut: '',
    });

    spyOn(console, 'error');

    component.onSubmitCreate();

    expect(mockProjectService.createProject).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Erreur création projet', jasmine.any(Error));
  });
});
