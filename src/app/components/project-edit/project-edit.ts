import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Projet } from '../../services/projet/projet';
import { MembreProjetService } from '../../services/membre/membre'; // service membres pour check admin
import { MembreComponent } from '../membre/membre';
import { TaskComponent } from '../task/task';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [ReactiveFormsModule, MembreComponent, TaskComponent],
  templateUrl: './project-edit.html',
  styleUrls: ['./project-edit.css'],
})
export class ProjectEditComponent implements OnInit {
  editForm!: FormGroup;
  projet!: Projet;
  canEdit: boolean = false;
  isAdmin: boolean = false;
  currentUserId: number = 1;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private membreService: MembreProjetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const projetId = +this.route.snapshot.paramMap.get('id')!;
    this.projectService.getProjectById(projetId).subscribe((projetData) => {
      this.projet = projetData;
      this.canEdit = this.checkIfCanEdit(projetData);

      this.checkAdmin(projetId, this.currentUserId);

      this.editForm = this.fb.group({
        nom: [{ value: this.projet.nom, disabled: !this.canEdit }],
        description: [{ value: this.projet.description, disabled: !this.canEdit }],
        dateDebut: [{ value: this.projet.dateDebut, disabled: !this.canEdit }],
      });
    });
  }

  checkIfCanEdit(projet: Projet): boolean {
    return this.currentUserId === projet.createurId || this.isAdmin;
  }

  checkAdmin(projetId: number, userId: number): void {
    this.membreService.getMembresByProjet(projetId).subscribe((membres) => {
      this.isAdmin = membres.some(
        (m) => m.utilisateurId === userId && m.role.toLowerCase() === 'administrateur'
      );
    });
  }

  onSubmit() {
    if (this.editForm.valid && this.canEdit) {
      const updatedProject: Projet = { ...this.projet, ...this.editForm.getRawValue() };
      this.projectService
        .updateProject(this.projet.id!, updatedProject, this.currentUserId)
        .subscribe({
          next: () => alert('Projet mis à jour avec succès'),
          error: () => alert('Erreur lors de la mise à jour du projet'),
        });
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  onDeleteProject(projetId: number) {
    if (!confirm('Voulez-vous vraiment supprimer ce projet ?')) return;
    this.projectService.deleteProject(projetId, this.currentUserId).subscribe({
      next: () => {
        this.goHome();
      },
      error: (err) => {
        alert(err.error || 'Erreur lors de la suppression du projet');
      },
    });
  }
}
