import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { TacheService, Tache } from '../../services/tache/tache';
import { MembreProjetService, MembreProjet } from '../../services/membre/membre';
import { AuthService } from '../../services/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './task.html',
  styleUrls: ['./task.css'],
  providers: [DatePipe],
})
export class TaskComponent implements OnInit, OnChanges {
  @Input() projetId!: number;
  @Input() refreshFlag = 0;

  taches: Tache[] = [];
  membres: MembreProjet[] = [];
  filteredTaches: Tache[] = [];
  addForm!: FormGroup;

  statutFilter: string = 'all';

  isAdmin = false;
  isMembre = false;
  isObservateur = false;

  formReady = false;

  constructor(
    private fb: FormBuilder,
    private tacheService: TacheService,
    private membreService: MembreProjetService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projetId'] && this.projetId) {
      this.loadMembresAndSetRights(this.projetId);
      this.loadTaches(this.projetId);
    }
    if (changes['refreshFlag'] && !changes['projetId']) {
      this.loadMembresAndSetRights(this.projetId);
      this.loadTaches(this.projetId);
    }
  }

  private initForm(): void {
    this.addForm = this.fb.group({
      nom: [''],
      description: [''],
      dateEcheance: [''],
      priorite: ['moyenne'],
      membreId: [''],
    });
  }

  private loadMembresAndSetRights(projetId: number): void {
    this.membreService.getMembresByProjet(projetId).subscribe((membres) => {
      this.membres = membres;
      this.membres.forEach((membre, index) => {
        this.authService.getUserById(membre.utilisateurId).subscribe((user) => {
          this.membres[index].email = user.email;
        });
      });

      const currentUserId = Number(this.authService.getCurrentUserId());
      const member = membres.find((m) => m.utilisateurId === currentUserId);
      if (!member) {
        this.isAdmin = false;
        this.isMembre = false;
        this.isObservateur = false;
      } else {
        const role = member.role.trim().toLowerCase();
        this.isAdmin = role === 'administrateur';
        this.isMembre = role === 'membre';
        this.isObservateur = role === 'observateur';
      }
      this.formReady = true;
      if (this.isAdmin || this.isMembre) {
        this.addForm.enable();
      } else {
        this.addForm.disable();
      }
    });
  }

  private loadTaches(projetId: number): void {
    this.tacheService.getTachesByProjet(projetId).subscribe((taches) => {
      this.taches = taches;
      this.applyStatutFilter();
    });
  }

  getAssignationEmail(tache: Tache): string {
    if (!tache.membreId) return 'Non assignée';
    const membre = this.membres.find((m) => m.utilisateurId === tache.membreId);
    return membre?.email ?? 'Assigné inconnu';
  }

  onSubmit(): void {
    if ((this.isAdmin || this.isMembre) && this.addForm.valid) {
      const userId = Number(this.authService.getCurrentUserId());
      const formValue = this.addForm.value;
      const nouvelleTache: Partial<Tache> = {
        projetId: this.projetId,
        nom: formValue.nom,
        description: formValue.description || null,
        dateEcheance: formValue.dateEcheance || null,
        priorite: formValue.priorite,
        createurId: userId,
        membreId: this.isAdmin && formValue.membreId ? formValue.membreId : null,
      };

      this.tacheService.creerTache(nouvelleTache).subscribe({
        next: () => {
          this.loadTaches(this.projetId);
          this.addForm.reset({ priorite: 'moyenne' });
        },
        error: (error) => {
          console.error('Erreur lors de la création de la tâche :', error);
          alert('Erreur lors de la création de la tâche. Voir console pour détails.');
        },
      });
    }
  }

  trackByTacheId(_index: number, tache: Tache): number {
    return tache.id ?? _index;
  }

  goToTaskEdit(tache: Tache) {
    this.router.navigate(['/task-edit', tache.id]);
  }

  onChangeStatutFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.statutFilter = value;
    this.applyStatutFilter();
  }

  applyStatutFilter() {
    if (this.statutFilter === 'all') {
      this.filteredTaches = this.taches;
    } else {
      this.filteredTaches = this.taches.filter((t) => t.statut === this.statutFilter);
    }
  }
}
