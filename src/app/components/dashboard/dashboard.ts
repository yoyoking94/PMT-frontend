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
  projects: Project[] = [];
  username: string | null = '';

  constructor(private projectService: ProjectService, private authService: AuthService) {}

  ngOnInit() {
    this.authService.username$.subscribe({
      next: (name: string | null) => {
        this.username = name;
      },
    });
  }
}
