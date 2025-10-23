import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProjectEditComponent } from './project-edit';
import { ProjectService, Projet } from '../../services/projet/projet';
import { MembreProjetService, MembreProjet } from '../../services/membre/membre';
import { AuthService } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ProjectEditComponent', () => {
  let component: ProjectEditComponent;
  let fixture: ComponentFixture<ProjectEditComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let membreServiceSpy: jasmine.SpyObj<MembreProjetService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const dummyProjet: Projet = {
    id: 1,
    nom: 'Projet Test',
    description: 'Description test',
    dateDebut: '2025-10-23',
    createurId: 1,
  };

  const dummyMembres: MembreProjet[] = [
    { id: 1, projetId: 1, role: 'administrateur', utilisateurId: 1 },
    { id: 2, projetId: 1, role: 'membre', utilisateurId: 2 },
  ];

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjectById', 'updateProject', 'deleteProject']);
    membreServiceSpy = jasmine.createSpyObj('MembreProjetService', ['getMembresByProjet']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ProjectEditComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: MembreProjetService, useValue: membreServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectEditComponent);
    component = fixture.componentInstance;

    authServiceSpy.getCurrentUserId.and.returnValue(1);
    projectServiceSpy.getProjectById.and.returnValue(of(dummyProjet));
    membreServiceSpy.getMembresByProjet.and.returnValue(of(dummyMembres));

    fixture.detectChanges(); // appelle ngOnInit()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isAdmin and currentUserId correctly via public observable effects', () => {
    expect(component.isAdmin).toBeTrue();
    expect(component.canEdit).toBeTrue();

    // Le formulaire doit être enabled quand admin
    expect(component.editForm.enabled).toBeTrue();
  });

  it('should patch form values after loading project', () => {
    expect(component.editForm.value['nom']).toBe(dummyProjet.nom);
    expect(component.editForm.value['description']).toBe(dummyProjet.description);
    expect(component.editForm.value['dateDebut']).toBe(dummyProjet.dateDebut);
  });

  it('should update project on valid form submit', fakeAsync(() => {
    component.canEdit = true;

    projectServiceSpy.updateProject.and.returnValue(of(dummyProjet));
    spyOn(window, 'alert');

    component.onSubmit();
    tick();

    expect(projectServiceSpy.updateProject).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Projet mis à jour avec succès');
  }));

  it('should not update when form invalid or cannot edit', () => {
    component.canEdit = false;
    component.onSubmit();
    expect(projectServiceSpy.updateProject).not.toHaveBeenCalled();

    component.canEdit = true;
    component.editForm.controls['nom'].setErrors({ required: true });
    component.onSubmit();
    expect(projectServiceSpy.updateProject).not.toHaveBeenCalled();
  });

  it('should navigate home on delete confirmation', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'goHome');
    projectServiceSpy.deleteProject.and.returnValue(of({}));

    component.onDeleteProject(dummyProjet.id);
    tick();

    expect(projectServiceSpy.deleteProject).toHaveBeenCalledWith(dummyProjet.id, 1);
    expect(component.goHome).toHaveBeenCalled();
  }));

  it('should not delete if confirmation denied', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.onDeleteProject(dummyProjet.id);
    expect(projectServiceSpy.deleteProject).not.toHaveBeenCalled();
  });

  it('should navigate home', () => {
    component.goHome();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
