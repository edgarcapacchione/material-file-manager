import { Routes } from '@angular/router';
import { BrowseComponent } from '../browse/browse.component';
import { LoginComponent } from '../auth/login/login.component';
import { authGuard, anonymousGuard } from '../auth/auth.guard';
import { ShellComponent } from './shell/shell.component';

export const routes: Routes = [
    {
      path: 'login',
      component: LoginComponent,
      canActivate: [anonymousGuard]
    },
    {
      path: '',
      component: ShellComponent,
      canActivate: [authGuard],
      children: [
        { path: '', pathMatch: 'full', redirectTo: 'browse' },
        { path: 'browse', component: BrowseComponent }
      ]
    },
    { path: '**', redirectTo: 'browse' }
];
