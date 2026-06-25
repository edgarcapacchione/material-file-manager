import { Routes } from '@angular/router';
import { BrowseComponent } from '../browse/browse.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'browse' },
    { path: 'browse', component: BrowseComponent },
    { path: '**', redirectTo: 'browse' }
];
