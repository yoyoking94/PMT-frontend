import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, ProjectService } from '../../services/project/project';
import { AuthService } from '../../services/auth/auth';
import { ProjectsComponent } from '../project/project';

/**
 * Composant affichant le tableau de bord avec la liste de projets.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProjectsComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  projects: Project[] = []; // Liste de projets (pas utilisée ici, mais prévue)
  username: string | null = ''; // Nom d'utilisateur connecté

  constructor(private projectService: ProjectService, private authService: AuthService) {}

  /**
   * Initialisation du composant:
   * - Souscription à l'observable du nom d'utilisateur
   */
  ngOnInit() {
    this.authService.username$.subscribe({
      next: (name: string | null) => {
        this.username = name;
      },
    });
  }
}
