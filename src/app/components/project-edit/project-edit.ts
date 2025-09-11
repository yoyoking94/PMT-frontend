import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project/project';
import { ProjectMemberService } from '../../services/project-member/project-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-edit.html',
  styleUrls: ['./project-edit.css'],
})
export class ProjectEditComponent implements OnInit {
  projects: Project[] = [];
  currentUserId: number = 0;

  editProject: Project = { id: 0, name: '', description: '', startDate: '', createBy: 0 };

  inviteErrorMessage = '';
  inviteEmailExists: boolean | null = null;
  inviteEmailIsMember: boolean | null = null;
  inviteChecking = false;

  inviteEmail = '';
  inviteRole = 'MEMBER';
  members: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private projectMemberService: ProjectMemberService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserId = Number(localStorage.getItem('userId')) || 0;
    const idStr = this.route.snapshot.paramMap.get('id');
    const projectId = idStr ? Number(idStr) : 0;

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        const project = this.projects.find((p) => p.id === projectId);
        if (project) {
          this.editProject = { ...project };
          this.loadProjectMembers();
        } else {
          alert('Projet non trouvé');
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        alert('Erreur lors du chargement des projets');
        this.router.navigate(['/dashboard']);
      },
    });
  }

  loadProjectMembers() {
    this.projectMemberService.getProjectMembers(this.editProject.id!).subscribe({
      next: (data) => {
        this.members = [...data]; // nouvelle référence pour changer la variable
        this.cdr.detectChanges(); // force rafraîchissement DOM
      },
      error: () => {
        this.members = [];
        this.cdr.detectChanges();
      },
    });
  }

  saveEdit() {
    this.projectService.updateProject(this.editProject.id!, this.editProject).subscribe({
      next: () => {
        alert('Projet mis à jour');
        this.router.navigate(['/dashboard']);
      },
      error: () => alert('Erreur lors de la mise à jour'),
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  canModifyProject(): boolean {
    // L’utilisateur peut modifier s’il est créateur ou admin dans cette liste
    if (this.editProject.createBy === this.currentUserId) return true;

    const member = this.members.find((m) => m.user.id === this.currentUserId);
    return member ? member.role === 'ADMIN' : false;
  }

  deleteProject() {
    if (!confirm('Confirmer la suppression ?')) return;
    this.projectService.deleteProject(this.editProject.id!, this.currentUserId).subscribe({
      next: () => {
        alert('Projet supprimé');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => alert(err.error || 'Erreur lors de la suppression'),
    });
  }

  onInviteEmailChange() {
    this.inviteChecking = true;
    this.inviteEmailExists = null;
    this.inviteEmailIsMember = null;
    this.inviteErrorMessage = '';

    if (!this.inviteEmail) {
      this.inviteChecking = false;
      return;
    }

    this.projectMemberService
      .checkIfUserIsMember(this.editProject.id!, this.inviteEmail)
      .subscribe({
        next: (res) => {
          this.inviteEmailExists = res.exists;
          this.inviteEmailIsMember = res.isMember;
          this.inviteChecking = false;

          if (!res.exists) {
            this.inviteErrorMessage = 'Utilisateur inexistant';
          } else if (res.isMember) {
            this.inviteErrorMessage = 'Cet utilisateur est déjà membre du projet';
          } else {
            this.inviteErrorMessage = '';
          }
        },
        error: () => {
          this.inviteChecking = false;
          this.inviteErrorMessage = 'Erreur de vérification';
        },
      });
  }

  inviteMember() {
    if (!this.inviteEmail) {
      this.inviteErrorMessage = 'Veuillez saisir un email';
      return;
    }
    this.projectMemberService
      .inviteMember(this.editProject.id!, this.inviteEmail, this.inviteRole, this.currentUserId)
      .subscribe({
        next: () => {
          this.inviteErrorMessage = '';
          this.inviteEmail = '';
          this.inviteRole = 'MEMBER';
          // Recharge liste des membres actualisée
          this.loadProjectMembers();
        },
        error: (err) => {
          this.inviteErrorMessage =
            err.error === 'Utilisateur déjà membre du projet'
              ? 'Cet utilisateur est déjà membre de ce projet.'
              : "Erreur lors de l'invitation : " + (err.error || 'Erreur serveur');
        },
      });
  }

  removeMember(memberId: number) {
    this.projectMemberService
      .deleteMember(this.editProject.id!, memberId, this.currentUserId)
      .subscribe({
        next: () => {
          // Recharge liste après suppression
          this.loadProjectMembers();
        },
        error: (err) => {
          console.log(err);
          alert(err.error || 'Erreur lors de la suppression');
        },
      });
  }

  trackByMemberId(index: number, member: any): number {
    return member.id;
  }
}
