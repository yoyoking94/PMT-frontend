import { Component, OnInit } from '@angular/core';
import { Project, ProjectService } from '../../services/project.service';
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
  newProject: Partial<Project> = { name: '', description: '', startDate: '' };

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe((proj) => (this.projects = proj));
  }

  addProject() {
    // Récupère l'id utilisateur du localStorage (à adapter selon ton stockage : ici "userId")
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      alert('User not connected !');
      return;
    }
    const createBy = Number(userIdStr);

    const project: Project = {
      name: this.newProject.name!,
      description: this.newProject.description,
      startDate: this.newProject.startDate!,
      createBy,
    };

    this.projectService.createProject(project).subscribe(() => {
      this.newProject = { name: '', description: '', startDate: '' };
      this.loadProjects();
    });
  }
}
