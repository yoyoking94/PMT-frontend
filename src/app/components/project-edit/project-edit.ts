import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Projet } from '../../services/projet/projet';
import { MembreProjetService, MembreProjet } from '../../services/membre/membre';
import { MembreComponent } from '../membre/membre';
import { TaskComponent } from '../task/task';
import { AuthService } from '../../services/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MembreComponent, TaskComponent],
  templateUrl: './project-edit.html',
  styleUrls: ['./project-edit.css'],
})
export class ProjectEditComponent implements OnInit {
  editForm!: FormGroup;
  projet!: Projet;
  isAdmin = false;
  isMembre = false;
  isObservateur = false;
  currentUserId = 1;
  canEdit = false;
  refreshFlag = 0;

  membres: MembreProjet[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private membreService: MembreProjetService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const projetId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadProjectAndMembres(projetId);
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      nom: [{ value: '', disabled: true }, Validators.required],
      description: [{ value: '', disabled: true }],
      dateDebut: [{ value: '', disabled: true }],
    });
  }

  private loadProjectAndMembres(projetId: number): void {
    this.projectService.getProjectById(projetId).subscribe((projectData) => {
      this.projet = projectData;
      this.membreService.getMembresByProjet(projetId).subscribe((membres) => {
        this.membres = membres;
        this.setUserRolesAndEnableForm();
        this.populateForm();
      });
    });
  }

  private setUserRolesAndEnableForm(): void {
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

    this.canEdit = this.currentUserId === this.projet.createurId || this.isAdmin;

    if (this.isAdmin) {
      this.editForm.enable();
    } else if (this.isMembre) {
      this.editForm.disable();
    } else {
      this.editForm.disable();
    }
  }

  private populateForm(): void {
    this.editForm.patchValue({
      nom: this.projet.nom,
      description: this.projet.description,
      dateDebut: this.projet.dateDebut,
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid || !this.canEdit) return;

    const updatedProject: Projet = { ...this.projet, ...this.editForm.getRawValue() };
    this.projectService
      .updateProject(this.projet.id, updatedProject, this.currentUserId)
      .subscribe({
        next: () => alert('Projet mis à jour avec succès'),
        error: () => alert('Erreur lors de la mise à jour du projet'),
      });
  }

  onDeleteProject(projetId: number): void {
    if (!confirm('Voulez-vous vraiment supprimer ce projet ?')) return;
    this.projectService.deleteProject(projetId, this.currentUserId).subscribe({
      next: () => this.goHome(),
      error: (err) => alert(err.error || 'Erreur lors de la suppression du projet'),
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  onMembresChanged(): void {
    this.refreshFlag++;
  }
}
