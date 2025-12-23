import { Routes } from '@angular/router';
import { App } from './app';
import { BrowseComponent } from '../browse/browse.component';
import { DragDropComponent } from '../drag-drop/drag-drop.component';
import { TreeComponent } from '../tree/tree.component';

export const routes: Routes = [
    { path: '', component: App },
    { path: 'browse', component: BrowseComponent },
    { path: 'drag-drop', component: DragDropComponent },
    { path: 'tree', component: TreeComponent }
];
