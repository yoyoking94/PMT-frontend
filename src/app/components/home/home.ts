import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectService, Projet } from '../../services/projet/projet';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  createForm: FormGroup;
  myProjects: Projet[] = [];
  allProjects: Projet[] = [];
  filterText: string = '';
  currentUserId = 1;

  constructor(private projectService: ProjectService, private fb: FormBuilder) {
    this.createForm = this.fb.group({
      nom: [''],
      description: [''],
      dateDebut: [''],
    });
  }

  ngOnInit() {
    this.loadMyProjects();
    this.loadAllProjects();
  }

  loadMyProjects() {
    this.projectService.getMyProjects(this.currentUserId).subscribe((data) => {
      this.myProjects = data;
    });
  }

  loadAllProjects() {
    this.projectService.getAllProjects().subscribe((data) => {
      this.allProjects = data;
    });
  }

  filteredProjects() {
    if (!this.filterText) {
      return this.allProjects;
    }
    const filter = this.filterText.toLowerCase();
    return this.allProjects.filter(
      (projet) =>
        projet.nom.toLowerCase().includes(filter) ||
        (projet.description?.toLowerCase().includes(filter) ?? false) ||
        projet.dateDebut?.includes(filter)
    );
  }

  onSubmitCreate() {
    const newProject = { ...this.createForm.value, createurId: this.currentUserId };
    this.projectService.createProject(newProject).subscribe(
      () => {
        this.loadMyProjects();
        this.loadAllProjects();
        this.createForm.reset();
      },
      (error) => {
        console.error('Erreur création projet', error);
      }
    );
  }
}
