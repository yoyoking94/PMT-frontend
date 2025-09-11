import { AuthGuard } from './guards/auth.guard';
import { Routes } from '@angular/router';
import { SigninComponent } from './components/auth/signin/signin';
import { SignupComponent } from './components/auth/signup/signup';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProjectEditComponent } from './components/project-edit/project-edit';

export const routes: Routes = [
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'project-edit/:id', component: ProjectEditComponent, canActivate: [AuthGuard] },  // <-- nouvelle route
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];