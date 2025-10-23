import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskComponent } from './task';
import { TacheService, Tache } from '../../services/tache/tache';
import { MembreProjetService, MembreProjet } from '../../services/membre/membre';
import { AuthService } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let tacheServiceSpy: jasmine.SpyObj<TacheService>;
  let membreServiceSpy: jasmine.SpyObj<MembreProjetService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const dummyTaches: Tache[] = [
    { id: 1, projetId: 1, nom: 'Tâche 1', priorite: 'moyenne', statut: 'a_faire' },
    { id: 2, projetId: 1, nom: 'Tâche 2', priorite: 'haute', statut: 'en_cours' },
  ];

  const dummyMembres: MembreProjet[] = [
    { id: 1, projetId: 1, role: 'administrateur', utilisateurId: 1, email: 'admin@example.com' },
    { id: 2, projetId: 1, role: 'membre', utilisateurId: 2, email: 'membre@example.com' },
  ];

  beforeEach(async () => {
    tacheServiceSpy = jasmine.createSpyObj('TacheService', ['getTachesByProjet', 'creerTache']);
    membreServiceSpy = jasmine.createSpyObj('MembreProjetService', ['getMembresByProjet']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId', 'getUserById']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [TaskComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TacheService, useValue: tacheServiceSpy },
        { provide: MembreProjetService, useValue: membreServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;

    component.projetId = 1;
    authServiceSpy.getCurrentUserId.and.returnValue(1);
    membreServiceSpy.getMembresByProjet.and.returnValue(of(dummyMembres));
    tacheServiceSpy.getTachesByProjet.and.returnValue(of(dummyTaches));
    authServiceSpy.getUserById.and.callFake((id: number) => of({ id, email: `user${id}@example.com` }));

    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load membres and taches and set isAdmin, isMembre flags', fakeAsync(() => {
    component.ngOnChanges({ projetId: { currentValue: 1, firstChange: true, previousValue: null, isFirstChange: () => true } });
    tick();

    expect(component.membres.length).toBe(dummyMembres.length);
    expect(component.taches.length).toBe(dummyTaches.length);
    expect(component.isAdmin).toBeTrue();
    expect(component.isMembre).toBeFalse();
    expect(component.formReady).toBeTrue();
  }));

  it('should filter tasks by statut', () => {
    component.statutFilter = 'en_cours';
    component.applyStatutFilter();

    expect(component.filteredTaches.length).toBe(1);
    expect(component.filteredTaches[0].statut).toBe('en_cours');
  });

  it('should return all tasks if filter is "all"', () => {
    component.statutFilter = 'all';
    component.applyStatutFilter();

    expect(component.filteredTaches.length).toBe(dummyTaches.length);
  });

  it('should create new task when form is valid and user is admin', fakeAsync(() => {
    component.isAdmin = true;
    component.addForm.setValue({
      nom: 'Nouvelle tâche',
      description: 'Description',
      dateEcheance: '2025-12-01',
      priorite: 'moyenne',
      membreId: 1,
    });

    tacheServiceSpy.creerTache.and.returnValue(of(dummyTaches[0]));
    spyOn(window, 'alert');

    component.onSubmit();
    tick();

    expect(tacheServiceSpy.creerTache).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Tâche créée avec succès!');
  }));

  it('should not create task if form invalid or user not admin/membre', () => {
    component.isAdmin = false;
    component.isMembre = false;
    component.addForm.setValue({ nom: '', description: '', dateEcheance: '', priorite: 'moyenne', membreId: '' });

    component.onSubmit();

    expect(tacheServiceSpy.creerTache).not.toHaveBeenCalled();
  });

  it('should navigate to task edit', () => {
    component.goToTaskEdit(dummyTaches[0]);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/task-edit', dummyTaches[0].id]);
  });
});
