import { Component, OnInit } from '@angular/core';
import { Project, ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectMemberService } from '../../services/project-member.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project.html',
  styleUrls: ['./project.css'],
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  currentUserId: number = 0;

  newProject: Partial<Project> = { name: '', description: '', startDate: '' };

  // Modal
  modalVisible = false;
  editProject: Project = { id: 0, name: '', description: '', startDate: '', createBy: 0 };

  // Invitation
  inviteEmail = '';
  inviteRole = 'MEMBER';

  constructor(
    private projectService: ProjectService,
    private projectMemberService: ProjectMemberService
  ) {}

  ngOnInit(): void {
    const userIdStr = localStorage.getItem('userId');
    this.currentUserId = userIdStr ? Number(userIdStr) : 0;
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe((data) => (this.projects = data));
  }

  addProject() {
    if (!this.newProject.name || !this.newProject.startDate) {
      alert('Veuillez remplir nom et date');
      return;
    }

    const project: Project = {
      name: this.newProject.name!,
      description: this.newProject.description,
      startDate: this.newProject.startDate!,
      createBy: this.currentUserId,
    };

    this.projectService.createProject(project).subscribe(() => {
      this.newProject = { name: '', description: '', startDate: '' };
      this.loadProjects();
    });
  }

  openModal(project: Project) {
    this.editProject = { ...project };
    this.inviteEmail = '';
    this.inviteRole = 'MEMBER';
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  saveEdit() {
    this.projectService.updateProject(this.editProject.id!, this.editProject).subscribe(
      () => {
        this.loadProjects();
        this.closeModal();
      },
      () => alert('Erreur lors de la mise à jour')
    );
  }

  deleteProject(projectId: number) {
    if (!confirm('Confirmer la suppression ?')) return;
    this.projectService.deleteProject(projectId, this.currentUserId).subscribe(
      () => {
        this.loadProjects();
        this.closeModal();
      },
      (err) => alert(err.error || 'Erreur lors de la suppression')
    );
  }

  inviteMember() {
    if (!this.inviteEmail) {
      alert('Veuillez saisir un email');
      return;
    }
    this.projectMemberService
      .inviteMember(this.editProject.id!, this.inviteEmail, this.inviteRole, this.currentUserId)
      .subscribe(
        () => {
          alert('Invitation envoyée');
          this.inviteEmail = '';
          this.inviteRole = 'MEMBER';
        },
        (err) => alert("Erreur lors de l'invitation")
      );
  }
}
