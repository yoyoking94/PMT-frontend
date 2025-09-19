import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project, ProjectService } from '../../services/project/project';
import { ProjectMemberService } from '../../services/project-member/project-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, map } from 'rxjs';

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
  userProjects: Project[] = [];

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
    this.projectService.createProject(proj).subscribe(() => {
      this.newProject = { name: '', description: '', startDate: '' };
      this.loadProjects();
    });
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;

      const memberObservables = data.map((proj) =>
        this.memberService.getProjectMembers(proj.id!).pipe(
          map((members) => ({
            projectId: proj.id,
            members: members.map((m) => ({ role: m.role, userId: m.user.id })),
          }))
        )
      );

      forkJoin(memberObservables).subscribe((results) => {
        results.forEach((r) => {
          this.membersMap[r.projectId!] = r.members;
        });

        this.userProjects = this.projects.filter((proj) => {
          if (proj.createBy === this.currentUserId) return true;
          const members = this.membersMap[proj.id!] || [];
          return members.some(
            (m) => ['ADMIN', 'MEMBER'].includes(m.role) && m.userId === this.currentUserId
          );
        });
      });
    });
  }

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
            (m) =>
              m.userId === this.currentUserId &&
              (m.role === 'ADMIN' || m.role === 'MEMBER' || m.role === 'OBSERVER')
          )
        : false;
    }

    return false;
  }

  openEdit(project: Project) {
    if (this.canAccessProject(project, 'edit') || this.canAccessProject(project, 'view')) {
      this.router.navigate(['/project-edit', project.id]);
    } else {
      console.error('Accès refusé au projet');
    }
  }

  trackByProjectId(index: number, project: Project): any {
    return project.id;
  }
}
