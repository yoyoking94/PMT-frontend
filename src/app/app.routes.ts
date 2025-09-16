import { AuthGuard } from './guards/auth.guard';
import { Routes } from '@angular/router';
import { SigninComponent } from './components/auth/signin/signin';
import { SignupComponent } from './components/auth/signup/signup';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProjectEditComponent } from './components/project-edit/project-edit';

/**
 * Liste de routes principales de l’application.
 * - AuthGuard protège les routes nécessitant une authentification
 * - Route paramétrée pour édition projet avec id dynamique
 * - Redirections simples pour racine et routes non reconnues
 */
export const routes: Routes = [
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard], // accès uniquement si connecté
  },
  {
    path: 'project-edit/:id',
    component: ProjectEditComponent,
    canActivate: [AuthGuard], // route sécurisée avec paramètre id dynamique
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // racine -> dashboard
  { path: '**', redirectTo: '/dashboard' }, // toutes autres redirections vers dashboard
];
