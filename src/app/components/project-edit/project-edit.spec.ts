import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ProjectEditComponent } from './project-edit';
import { ProjectService, Projet } from '../../services/projet/projet';
import { MembreProjetService, MembreProjet } from '../../services/membre/membre';
import { AuthService } from '../../services/auth/auth';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('ProjectEditComponent', () => {
  let component: ProjectEditComponent;
  let fixture: ComponentFixture<ProjectEditComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockMembreService: jasmine.SpyObj<MembreProjetService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const dummyProjet: Projet = {
    id: 1,
    nom: 'Projet Test',
    createurId: 1,
    dateDebut: '2025-01-01',
    priorite: 'moyenne',
  };

  const dummyMembres: MembreProjet[] = [
    { id: 1, projetId: 1, role: 'administrateur', utilisateurId: 1, email: 'admin@example.com' },
    { id: 2, projetId: 1, role: 'membre', utilisateurId: 2, email: 'membre@example.com' },
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjectById',
      'updateProject',
      'deleteProject',
    ]);
    mockMembreService = jasmine.createSpyObj('MembreProjetService', ['getMembresByProjet']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = { snapshot: { paramMap: { get: () => '1' } } };

    await TestBed.configureTestingModule({
      imports: [ProjectEditComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ProjectService, useValue: mockProjectService },
        { provide: MembreProjetService, useValue: mockMembreService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectEditComponent);
    component = fixture.componentInstance;

    mockProjectService.getProjectById.and.returnValue(of(dummyProjet));
    mockMembreService.getMembresByProjet.and.returnValue(of(dummyMembres));
    mockAuthService.getCurrentUserId.and.returnValue(1);

    fixture.detectChanges();
  });

  it('should create component and initialize data', () => {
    expect(component).toBeTruthy();
    expect(component.projet).toEqual(dummyProjet);
    expect(component.membres.length).toBe(2);
    expect(component.isAdmin).toBeTrue();
    expect(component.canEdit).toBeTrue();
  });

  it('should enable form for admin', () => {
    expect(component.editForm.enabled).toBeTrue();
  });

  it('should update project and show success alert', fakeAsync(() => {
    spyOn(window, 'alert');
    mockProjectService.updateProject.and.returnValue(of(dummyProjet));

    component.onSubmit();
    tick();

    expect(mockProjectService.updateProject).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Projet mis à jour avec succès');
  }));

  it('should not update project if form invalid', () => {
    component.editForm.controls['nom'].setErrors({ required: true });
    component.onSubmit();

    expect(mockProjectService.updateProject).not.toHaveBeenCalled();
  });

  it('should delete project on confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockProjectService.deleteProject.and.returnValue(of({}));

    const goHomeSpy = spyOn(component, 'goHome').and.callThrough();

    component.onDeleteProject(dummyProjet.id);

    expect(mockProjectService.deleteProject).toHaveBeenCalledWith(dummyProjet.id, 1);
    expect(goHomeSpy).toHaveBeenCalled();
  });

  it('should not delete project if confirmation cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.onDeleteProject(dummyProjet.id);

    expect(mockProjectService.deleteProject).not.toHaveBeenCalled();
  });
});
