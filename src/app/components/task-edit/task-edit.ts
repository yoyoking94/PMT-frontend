import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TacheService, Tache } from '../../services/tache/tache';
import { MembreProjetService, MembreProjet } from '../../services/membre/membre';
import { AuthService } from '../../services/auth/auth';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './task-edit.html',
  styleUrls: ['./task-edit.css'],
})
export class TaskEditComponent implements OnInit {
  taskForm!: FormGroup;
  taskId!: number;
  tache!: Tache;
  membres: MembreProjet[] = [];
  isAdmin = false;
  isMembre = false;
  isObservateur = false;
  loading = true;
  historique: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tacheService: TacheService,
    private membreService: MembreProjetService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadTaskAndMembres();
    this.loadHistorique();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      nom: [{ value: '', disabled: true }, Validators.required],
      description: [{ value: '', disabled: true }],
      dateEcheance: [{ value: '', disabled: true }],
      priorite: [{ value: 'moyenne', disabled: true }],
      statut: [{ value: 'a_faire', disabled: true }],
      membreId: [{ value: '', disabled: true }],
    });
  }

  private loadTaskAndMembres(): void {
    this.tacheService.getTacheById(this.taskId).subscribe({
      next: (t) => {
        this.tache = t;
        this.membreService.getMembresByProjet(t.projetId).subscribe((membres) => {
          this.membres = membres;
          let loaded = 0;

          membres.forEach((membre, index) => {
            this.authService.getUserById(membre.utilisateurId).subscribe((user: any) => {
              this.membres[index].email = user.email;
              loaded++;
              if (loaded === membres.length) {
                this.setUserRoleAndEnableForm();
                this.populateForm();
                this.loading = false;
              }
            });
          });
        });
      },
      error: () => {
        alert('Erreur lors du chargement de la tâche.');
        this.router.navigate(['/']);
      },
    });
  }

  private setUserRoleAndEnableForm(): void {
    const currentUserId = this.authService.getCurrentUserId();
    const member = this.membres.find((m) => m.utilisateurId === currentUserId);

    if (!member) {
      this.isAdmin = false;
      this.isMembre = false;
      this.isObservateur = true;
    } else {
      const role = member.role.trim().toLowerCase();
      this.isAdmin = role === 'administrateur';
      this.isMembre = role === 'membre';
      this.isObservateur = role === 'observateur';
    }

    if (this.isAdmin) {
      this.taskForm.enable();
    } else if (this.isMembre) {
      this.taskForm.get('statut')!.enable();
      this.taskForm.get('nom')?.disable();
      this.taskForm.get('description')?.disable();
      this.taskForm.get('dateEcheance')?.disable();
      this.taskForm.get('priorite')?.disable();
      this.taskForm.get('membreId')?.disable();
    } else {
      this.taskForm.disable();
    }
  }

  private populateForm(): void {
    this.taskForm.patchValue({
      nom: this.tache.nom,
      description: this.tache.description,
      dateEcheance: this.tache.dateEcheance,
      priorite: this.tache.priorite,
      statut: this.tache.statut,
      membreId: this.tache.membreId || '',
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const currentUserId = this.authService.getCurrentUserId();
    const userRole = this.isAdmin ? 'administrateur' : this.isMembre ? 'membre' : 'observateur';

    const updatedTache: Partial<Tache> = {
      ...this.taskForm.value,
      dateEcheance: this.taskForm.value.dateEcheance || null,
      membreId: this.isAdmin ? this.taskForm.value.membreId || null : null,
    };

    this.tacheService.updateTache(this.taskId, updatedTache, currentUserId!, userRole).subscribe({
      next: (t) => {
        alert('Tâche mise à jour');
        this.router.navigate(['/projects/edit', t.projetId]);
      },
      error: () => {
        alert('Erreur lors de la mise à jour de la tâche');
      },
    });
  }

  onDeleteTask(): void {
    if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      return;
    }
    this.tacheService.deleteTache(this.taskId).subscribe({
      next: () => {
        alert('Tâche supprimée');
        this.goBack();
      },
      error: () => {
        alert('Erreur lors de la suppression de la tâche');
      },
    });
  }

  loadHistorique(): void {
    this.http
      .get<any[]>(`http://localhost:8080/api/taches/${this.taskId}/historique`)
      .subscribe((data) => {
        // Pour chaque entrée, on récupère le nom ou email
        data.forEach((entry) => {
          this.http
            .get<any>(`http://localhost:8080/api/utilisateurs/${entry.utilisateurId}`)
            .subscribe((user) => {
              entry.utilisateurEmail = user.email; // ou user.nom
            });
        });
        this.historique = data;
      });
  }

  goBack(): void {
    if (this.tache && this.tache.projetId) {
      this.router.navigate(['/projects/edit', this.tache.projetId]);
    } else {
      this.router.navigate(['/']); // fallback si pas de projetId
    }
  }
}
