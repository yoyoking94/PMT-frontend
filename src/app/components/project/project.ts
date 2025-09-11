import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project, ProjectService } from '../../services/project/project';
import { ProjectMemberService } from '../../services/project-member/project-member';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project.html',
  styleUrls: ['./project.css'],
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  currentUserId = 0;
  membersMap: { [projectId: number]: any[] } = {};
  newProject: Partial<Project> = { name: '', description: '', startDate: '' };

  constructor(
    private projectService: ProjectService,
    private memberService: ProjectMemberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idStr = localStorage.getItem('userId');
    this.currentUserId = idStr ? Number(idStr) : 0;
    this.loadProjects();
  }

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
        this.loadProjects();
      },
    });
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;

        // Pour chaque projet charge les membres et stocke dans membersMap
        data.forEach((proj) => {
          this.memberService.getProjectMembers(proj.id!).subscribe({
            next: (members) => {
              this.membersMap[proj.id!] = members.map((m) => ({
                role: m.role,
                userId: m.user.id,
              }));
            },
            error: () => {
              this.membersMap[proj.id!] = [];
            },
          });
        });
      },
    });
  }

  canAccessProject(project: Project, action: 'edit' | 'view'): boolean {
    // L'admin et le créateur du projet peuvent éditer
    if (action === 'edit') {
      if (project.createBy === this.currentUserId) return true;
      const members = this.membersMap[project.id!];
      return members
        ? members.some((m) => m.userId === this.currentUserId && m.role === 'ADMIN')
        : false;
    }

    // Pour la vue, les rôles admin, member ou créateur ont accès
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

  openEdit(project: Project) {
    // Autoriser si droit edit OU view (ex : membres simples)
    if (this.canAccessProject(project, 'edit') || this.canAccessProject(project, 'view')) {
      this.router.navigate(['/project-edit', project.id]);
    } else {
      console.error('Accès refusé au projet');
      // Optionnel : afficher un message user-friendly
    }
  }
}
