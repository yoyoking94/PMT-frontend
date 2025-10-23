import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MembreComponent } from './membre';
import { MembreProjetService, MembreProjet } from '../../services/membre/membre';
import { AuthService } from '../../services/auth/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('MembreComponent', () => {
  let component: MembreComponent;
  let fixture: ComponentFixture<MembreComponent>;
  let membreServiceSpy: jasmine.SpyObj<MembreProjetService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const dummyMembres: MembreProjet[] = [
    { id: 1, projetId: 1, role: 'administrateur', utilisateurId: 1 },
    { id: 2, projetId: 1, role: 'membre', utilisateurId: 2 },
  ];

  beforeEach(async () => {
    membreServiceSpy = jasmine.createSpyObj('MembreProjetService', ['getMembresByProjet', 'addMembreByEmail', 'removeMembre']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId', 'getUserById']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MembreComponent],
      providers: [
        { provide: MembreProjetService, useValue: membreServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembreComponent);
    component = fixture.componentInstance;
    component.projetId = 1;

    authServiceSpy.getCurrentUserId.and.returnValue(1);
    membreServiceSpy.getMembresByProjet.and.returnValue(of(dummyMembres));
    authServiceSpy.getUserById.and.callFake((id: number) =>
      of({ id: id, email: `user${id}@example.com` })
    );
    
    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load membres and set isAdmin correctly', fakeAsync(() => {
    tick();
    expect(component.membres.length).toBe(2);
    expect(component.isAdmin).toBeTrue();
    expect(component.membres[0].email).toBe('user1@example.com');
  }));

  it('should add membre if form is valid and user is admin', fakeAsync(() => {
    component.isAdmin = true;
    component.addForm.setValue({ email: 'newuser@example.com', role: 'membre' });

    membreServiceSpy.addMembreByEmail.and.returnValue(of({} as MembreProjet));
    spyOn(component.membresChanged, 'emit');

    component.addMembre();
    tick();

    expect(membreServiceSpy.addMembreByEmail).toHaveBeenCalledWith(1, 'newuser@example.com', 'membre', 1);
    expect(component.membresChanged.emit).toHaveBeenCalled();
    expect(component.addForm.value.email).toBeNull();
  }));

  it('should not add membre if form invalid', () => {
    component.isAdmin = true;
    component.addForm.setErrors({ invalid: true });
    component.addMembre();
    expect(membreServiceSpy.addMembreByEmail).not.toHaveBeenCalled();
  });

  it('should delete membre and emit event', fakeAsync(() => {
    spyOn(component.membresChanged, 'emit');
    membreServiceSpy.removeMembre.and.returnValue(of(void 0));

    component.deleteMembre(2);
    tick();

    expect(membreServiceSpy.removeMembre).toHaveBeenCalledWith(2);
    expect(component.membresChanged.emit).toHaveBeenCalled();
  }));
});
