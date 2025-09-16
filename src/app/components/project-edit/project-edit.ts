import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project/project';
import { ProjectMemberService } from '../../services/project-member/project-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskService } from '../../services/task/task';

/**
 * Composant pour modifier un projet, gérer ses membres et ses tâches.
 */
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

  editProject: Project = {
    id: 0,
    name: '',
    description: '',
    startDate: '',
    createBy: 0,
  };

  inviteErrorMessage = '';
  inviteEmailExists: boolean | null = null;
  inviteEmailIsMember: boolean | null = null;
  inviteChecking = false;

  inviteEmail = '';
  inviteRole = 'MEMBER';
  members: any[] = [];

  tasks: Task[] = [];
  newTask: Partial<Task> = {
    name: '',
    description: '',
    dueDate: '',
    priority: 'Moyenne',
    project: { id: 0 },
    status: 'etudes',
  };

  editingTaskId: number | null | undefined = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private projectMemberService: ProjectMemberService,
    private cdr: ChangeDetectorRef,
    private taskService: TaskService
  ) {}

  /**
   * Initialisation :
   * - Récupère id utilisateur et id projet URL
   * - Charge les projets et initialise editProject
   * - Charge membres et tâches du projet
   */
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
          this.loadTasks();
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

    this.loadTasks();
  }

  /**
   * Charge la liste des membres du projet
   */
  loadProjectMembers() {
    this.projectMemberService.getProjectMembers(this.editProject.id!).subscribe({
      next: (data) => {
        this.members = [...data]; // nouvelle référence pour déclencher changement
        this.cdr.detectChanges(); // rafraîchit le DOM
      },
      error: () => {
        this.members = [];
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Charge les tâches liées au projet
   */
  loadTasks() {
    if (!this.editProject.id) return;
    this.taskService.getTasksByProject(this.editProject.id).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.cdr.detectChanges();
      },
      error: () => {
        this.tasks = [];
      },
    });
  }

  /**
   * Ajoute une nouvelle tâche associée au projet
   */
  addTask() {
    if (!this.newTask.name || !this.newTask.dueDate) {
      alert('Le nom et la date de début sont obligatoires.');
      return;
    }
    this.newTask.project!.id = this.editProject.id!;
    this.taskService.createTask(this.newTask as Task).subscribe({
      next: () => {
        this.newTask = {
          name: '',
          description: '',
          dueDate: '',
          priority: 'Moyenne',
          project: { id: this.editProject.id! },
          status: 'etudes',
        };
        this.loadTasks(); // recharge la liste des tâches
      },
      error: () => {
        alert('Erreur lors de la création de la tâche');
      },
    });
  }

  /**
   * Vérifie le statut de la tache (design)
   */
  getTaskStatusClass(status: string): string {
    switch (status) {
      case 'etudes':
        return 'status-etudes';
      case 'en cours':
        return 'status-en-cours';
      case 'test':
        return 'status-test';
      case 'fait':
        return 'status-fait';
      default:
        return '';
    }
  }

  /**
   * Vérifie si l'utilisateur peut éditer une tâche
   */
  canEditTask(task: Task): boolean {
    if (this.canModifyProject()) return true;
    return task.assignedTo === this.currentUserId;
  }

  /**
   * Sauvegarde une tâche modifiée
   */
  saveTask(task: Task) {
    this.taskService.updateTask(task).subscribe({
      next: () => {
        alert('Tâche mise à jour');
        this.loadTasks();
        this.editingTaskId = null;
      },
      error: () => alert('Erreur lors de la mise à jour de la tâche'),
    });
  }

  /**
   * Sauvegarde les modifications du projet
   */
  saveEdit() {
    this.projectService.updateProject(this.editProject.id!, this.editProject).subscribe({
      next: () => {
        alert('Projet mis à jour');
        this.router.navigate(['/dashboard']);
      },
      error: () => alert('Erreur lors de la mise à jour'),
    });
  }

  /**
   * Navigation vers le dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Vérifie si l'utilisateur peut modifier le projet
   */
  canModifyProject(): boolean {
    if (this.editProject.createBy === this.currentUserId) return true;
    const member = this.members.find((m) => m.user.id === this.currentUserId);
    return member ? member.role === 'ADMIN' : false;
  }

  /**
   * Supprime le projet
   */
  deleteProject() {
    this.projectService.deleteProject(this.editProject.id!, this.currentUserId).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(err.error || 'Erreur lors de la suppression');
        console.error(err);
      },
    });
  }

  /**
   * Vérifie email lors de saisie pour invitation
   */
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

  /**
   * Invite un membre par email avec rôle
   */
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

  /**
   * Supprime un membre du projet
   */
  removeMember(memberId: number) {
    this.projectMemberService
      .deleteMember(this.editProject.id!, memberId, this.currentUserId)
      .subscribe({
        next: () => {
          this.loadProjectMembers();
        },
        error: (err) => {
          console.log(err);
          alert(err.error || 'Erreur lors de la suppression');
        },
      });
  }

  /**
   * Trackers d'optimisation pour *ngFor
   */
  trackByMemberId(index: number, member: any): number {
    return member.id;
  }

  trackByTaskId(index: number, task: any): number {
    return task.id!;
  }
}
