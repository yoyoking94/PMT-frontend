import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { SigninComponent } from './components/auth/signin/signin';
import { SignupComponent } from './components/auth/signup/signup';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // racine redirigée vers dashboard
  { path: '**', redirectTo: '/dashboard' },
];
