import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, ProjectService } from '../../services/project/project';
import { AuthService } from '../../services/auth/auth';
import { ProjectsComponent } from '../project/project';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProjectsComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  projects: Project[] = []; // Liste des projets
  username: string | null = ''; // Nom d'utilisateur connecté
  error: string = ''; // Message d'erreur pour la récupération projet

  constructor(private projectService: ProjectService, private authService: AuthService) {}

  ngOnInit() {
    this.authService.username$.subscribe({
      next: (name: string | null) => {
        this.username = name;
      },
    });

    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.error = '';
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des projets.';
        console.error(err);
      },
    });
  }
}
