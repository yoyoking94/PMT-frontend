import { Routes } from '@angular/router';
import { SigninComponent } from './auth/signin/signin';
import { SignupComponent } from './auth/signup/signup';

export const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
];
