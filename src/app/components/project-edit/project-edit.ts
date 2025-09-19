import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project/project';
import { ProjectMemberService } from '../../services/project-member/project-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskService } from '../../services/task/task';

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
    assignedTo: undefined,
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

    this.tasks.forEach((task) => {
      if (!task.assignedTo) {
        task.assignedTo = undefined; // ou null
      }
    });
  }

  loadProjectMembers() {
    this.projectMemberService.getProjectMembers(this.editProject.id!).subscribe({
      next: (data) => {
        this.members = [...data];
        this.cdr.detectChanges();
      },
      error: () => {
        this.members = [];
        this.cdr.detectChanges();
      },
    });
  }

  loadTasks() {
    if (!this.editProject.id) return;

    this.taskService.getTasksByProject(this.editProject.id).subscribe({
      next: (tasks) => {
        // Assure que assignedTo est un number (ID) et ajoute assignedToName
        tasks.forEach((task) => {
          if (task.assignedTo && typeof task.assignedTo !== 'number') {
            task.assignedTo = (task.assignedTo as any).id || undefined;
          }

          // Trouver le membre assigné et stocker son nom
          const member = this.members.find((m) => m.user.id === task.assignedTo);
          task.assignedToName = member ? member.user.username : 'Non assignée';
        });
        this.tasks = tasks;
        this.cdr.detectChanges();
      },
      error: () => {
        this.tasks = [];
      },
    });
  }

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
        this.loadTasks();
      },
      error: () => {
        alert('Erreur lors de la création de la tâche');
      },
    });
  }

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

  canEditTask(task: Task): boolean {
    if (this.canModifyProject()) return true; // Admin/créateur peuvent tout modifier

    const member = this.members.find((m) => m.user.id === this.currentUserId);
    if (!member) return false;

    if (member.role === 'OBSERVER') {
      // Observateurs ne peuvent éditer que les tâches qui leur sont assignées
      return task.assignedTo === this.currentUserId;
    }

    // Membres normaux peuvent modifier les tâches qui leur sont assignées
    return task.assignedTo === this.currentUserId;
  }

  canEditField(task: Task, field: string): boolean {
    if (this.canModifyProject()) return true; // tout modifiable par Admin/créateur

    const member = this.members.find((m) => m.user.id === this.currentUserId);
    if (!member) return false;

    if (member.role === 'OBSERVER') {
      // Observateurs ne peuvent modifier que le statut sur tâches qui leur sont assignées (déjà géré par canEditTask)
      return field === 'status';
    }

    // Membres normaux peuvent modifier tout sur leurs tâches
    if (task.assignedTo === this.currentUserId) return true;

    return false;
  }

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

  saveEdit() {
    console.log('Projet envoyé au backend:', this.editProject);
    this.projectService.updateProject(this.editProject.id!, this.editProject).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        alert('Erreur lors de la mise à jour : ' + (error.error || error.message));
        console.error(error);
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  canModifyProject(): boolean {
    if (this.editProject.createBy === this.currentUserId) return true;
    const member = this.members.find((m) => m.user.id === this.currentUserId);
    return member ? member.role === 'ADMIN' : false;
  }

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
          this.loadProjectMembers();
        },
        error: (err) => {
          console.error(err);
          alert(err.error || 'Erreur lors de la suppression');
        },
      });
  }

  trackByMemberId(index: number, member: any): number {
    return member.id;
  }

  trackByTaskId(index: number, task: any): number {
    return task.id!;
  }
}
