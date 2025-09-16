import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project, ProjectService } from '../../services/project/project';
import { ProjectMemberService } from '../../services/project-member/project-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, map } from 'rxjs';

/**
 * Composant gérant l'affichage, la création et la navigation des projets.
 */
@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project.html',
  styleUrls: ['./project.css'],
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = []; // Tous les projets existants
  currentUserId = 0; // Id utilisateur courant (depuis localStorage)
  membersMap: { [projectId: number]: any[] } = {}; // Map projet -> liste des membres
  newProject: Partial<Project> = { name: '', description: '', startDate: '' }; // Formulaire création projet
  userProjects: Project[] = []; // Projets dont l'utilisateur est membre ou créateur

  constructor(
    private projectService: ProjectService,
    private memberService: ProjectMemberService,
    private router: Router
  ) {}

  /**
   * Initialisation : récupère l'ID utilisateur puis charge les projets.
   */
  ngOnInit(): void {
    const idStr = localStorage.getItem('userId');
    this.currentUserId = idStr ? Number(idStr) : 0;
    this.loadProjects();
  }

  /**
   * Ajoute un nouveau projet si nom et date sont renseignés.
   */
  addProject(): void {
    if (!this.newProject.name || !this.newProject.startDate) {
      alert('Veuillez remplir nom et date');
      return;
    }
    const proj: Project = {
      name: this.newProject.name!,
      description: this.newProject.description,
      startDate: this.newProject.startDate!,
      createBy: this.currentUserId,
    };
    this.projectService.createProject(proj).subscribe({
      next: () => {
        this.newProject = { name: '', description: '', startDate: '' };
        this.loadProjects(); // Recharge la liste à jour
      },
    });
  }

  /**
   * Charge tous les projets puis récupère leurs membres,
   * filtre les projets où l'utilisateur a accès.
   */
  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;

        // Récupération asynchrone des membres pour chaque projet
        const memberObservables = data.map((proj) =>
          this.memberService.getProjectMembers(proj.id!).pipe(
            map((members) => ({
              projectId: proj.id,
              members: members.map((m) => ({ role: m.role, userId: m.user.id })),
            }))
          )
        );

        forkJoin(memberObservables).subscribe((results) => {
          // Remplit la map membres par projet
          results.forEach((r) => {
            this.membersMap[r.projectId!] = r.members;
          });

          // Filtre projets où l'utilisateur est créateur ou membre ADMIN/MEMBER
          this.userProjects = this.projects.filter((proj) => {
            if (proj.createBy === this.currentUserId) return true;
            const members = this.membersMap[proj.id!] || [];
            return members.some(
              (m) => ['ADMIN', 'MEMBER'].includes(m.role) && m.userId === this.currentUserId
            );
          });
        });
      },
    });
  }

  /**
   * Vérifie si l'utilisateur a accès au projet selon l'action désirée.
   * 'edit' : créateur ou membre ADMIN
   * 'view' : créateur, ADMIN ou MEMBER
   */
  canAccessProject(project: Project, action: 'edit' | 'view'): boolean {
    if (action === 'edit') {
      if (project.createBy === this.currentUserId) return true;
      const members = this.membersMap[project.id!];
      return members
        ? members.some((m) => m.userId === this.currentUserId && m.role === 'ADMIN')
        : false;
    }

    if (action === 'view') {
      if (project.createBy === this.currentUserId) return true;
      const members = this.membersMap[project.id!];
      return members
        ? members.some(
            (m) => m.userId === this.currentUserId && (m.role === 'ADMIN' || m.role === 'MEMBER')
          )
        : false;
    }

    return false;
  }

  /**
   * Ouvre la page d'édition d'un projet si accès autorisé.
   */
  openEdit(project: Project) {
    if (this.canAccessProject(project, 'edit') || this.canAccessProject(project, 'view')) {
      this.router.navigate(['/project-edit', project.id]);
    } else {
      console.error('Accès refusé au projet');
      // TODO : afficher message utilisateur en cas d'accès refusé
    }
  }

  /**
   * Tracker par id pour optimisation dans *ngFor.
   */
  trackByProjectId(index: number, project: Project): any {
    return project.id;
  }
}
