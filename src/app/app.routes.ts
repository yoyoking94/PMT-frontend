import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { ProjectEditComponent } from './components/project-edit/project-edit';
import { TaskEditComponent } from './components/task-edit/task-edit';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }, // Pas de guard ici
  { path: 'projects/edit/:id', component: ProjectEditComponent, canActivate: [AuthGuard] },
  { path: 'task-edit/:id', component: TaskEditComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }, // Pas besoin de guard au redirect
];
