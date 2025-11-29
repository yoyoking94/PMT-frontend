import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskEditComponent } from './task-edit';
import { TacheService, Tache } from '../../services/tache/tache';
import { MembreProjetService, MembreProjet } from '../../services/membre/membre';
import { AuthService } from '../../services/auth/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TaskEditComponent', () => {
  let component: TaskEditComponent;
  let fixture: ComponentFixture<TaskEditComponent>;
  let tacheServiceSpy: jasmine.SpyObj<TacheService>;
  let membreServiceSpy: jasmine.SpyObj<MembreProjetService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: any;

  const dummyTache: Tache = {
    id: 1,
    projetId: 1,
    nom: 'Tache Test',
    priorite: 'moyenne',
    statut: 'a_faire',
  };

  const dummyMembres: MembreProjet[] = [
    { id: 1, projetId: 1, role: 'administrateur', utilisateurId: 1, email: 'admin@example.com' },
    { id: 2, projetId: 1, role: 'membre', utilisateurId: 2, email: 'membre@example.com' },
  ];

  beforeEach(async () => {
    tacheServiceSpy = jasmine.createSpyObj('TacheService', [
      'getTacheById',
      'updateTache',
      'deleteTache',
    ]);
    membreServiceSpy = jasmine.createSpyObj('MembreProjetService', ['getMembresByProjet']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId', 'getUserById']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routeSpy = { snapshot: { paramMap: { get: () => '1' } } };

    await TestBed.configureTestingModule({
      imports: [TaskEditComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: TacheService, useValue: tacheServiceSpy },
        { provide: MembreProjetService, useValue: membreServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
      ],
    }).compileComponents();
  });

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TaskEditComponent);
    component = fixture.componentInstance;

    tacheServiceSpy.getTacheById.and.returnValue(of(dummyTache));
    membreServiceSpy.getMembresByProjet.and.returnValue(of(dummyMembres));
    authServiceSpy.getCurrentUserId.and.returnValue(1);
    authServiceSpy.getUserById.and.callFake((id: number) =>
      of({ id, email: `user${id}@example.com` })
    );

    fixture.detectChanges();
    tick();

    // Spies globaux UNE SEULE FOIS pour tous les tests
    spyOn(window, 'alert').and.stub();
    spyOn(window, 'confirm').and.stub();
  }));

  it('should create', () => expect(component).toBeTruthy());

  it('should call private setUserRoleAndEnableForm and populateForm indirectly', fakeAsync(() => {
    expect(() => component['setUserRoleAndEnableForm']()).not.toThrow();
    expect(() => component['populateForm']()).not.toThrow();
  }));

  it('should update task correctly', fakeAsync(() => {
    // ne pas re-spyOn alert ici, il l’est déjà dans beforeEach
    (window.confirm as jasmine.Spy).and.returnValue(true);
    component.isAdmin = true;
    component.taskForm.enable();
    component.taskForm.setValue({
      nom: 'Modif Tache',
      description: 'Desc modifiée',
      dateEcheance: '2025-10-30',
      priorite: 'haute',
      statut: 'en_cours',
      membreId: 1,
    });
    tacheServiceSpy.updateTache.and.returnValue(of({ ...dummyTache, nom: 'Modif Tache' }));

    component.onSubmit();
    tick();

    expect(tacheServiceSpy.updateTache).toHaveBeenCalledWith(
      component.taskId,
      jasmine.objectContaining({ nom: 'Modif Tache' }),
      1,
      'administrateur'
    );
    expect(window.alert).toHaveBeenCalledWith('Tâche mise à jour');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects/edit', dummyTache.projetId]);
  }));

  it('should not update if form invalid', () => {
    component.taskForm.controls['nom'].setErrors({ required: true });
    component.onSubmit();
    expect(tacheServiceSpy.updateTache).not.toHaveBeenCalled();
  });

  it('should delete task after confirmation', fakeAsync(() => {
    (window.confirm as jasmine.Spy).and.returnValue(true);
    component.taskId = dummyTache.id!;
    tacheServiceSpy.deleteTache.and.returnValue(of(void 0));
    spyOn(component, 'goBack');

    component.onDeleteTask();
    tick();

    expect(tacheServiceSpy.deleteTache).toHaveBeenCalledWith(component.taskId);
    expect(window.alert).toHaveBeenCalledWith('Tâche supprimée');
    expect(component.goBack).toHaveBeenCalled();
  }));

  it('should not delete on confirmation cancelled', () => {
    (window.confirm as jasmine.Spy).and.returnValue(false);
    component.onDeleteTask();
    expect(tacheServiceSpy.deleteTache).not.toHaveBeenCalled();
  });
});
