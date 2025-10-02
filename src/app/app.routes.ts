import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { ProjectEditComponent } from './components/project-edit/project-edit';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'projects/edit/:id', component: ProjectEditComponent },
  { path: '**', redirectTo: '' },
];
