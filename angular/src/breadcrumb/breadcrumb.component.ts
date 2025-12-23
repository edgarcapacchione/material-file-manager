import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowseService } from '../browse/browse.service';
import { MatDividerModule } from '@angular/material/divider';
import { DragselectService } from '../common/dragselect.service';
import { SidenavService } from '../app/sidenav.service';

@Component({
  selector: 'app-breadcrumb',
  imports: [
    MatIconModule, MatButtonModule, MatToolbarModule, MatDividerModule
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  constructor(public browseService: BrowseService, public sidenav: SidenavService, private dragSelect: DragselectService) {}

  getBackTo(index: number): void {
    const pathTo = this.browseService.getBreadcrumb()
      .splice(0, index + 1)
      .join('/');
    if (pathTo != this.browseService.getCurrentPath()) {
      this.browseService.browseTo(pathTo);
    }
  }

  changeMode(mode: string): void {
    if (mode == this.browseService.getMode()) {
      return;
    }
    this.dragSelect.stop();
    this.browseService.setMode(mode);
    this.dragSelect.init();
  }

}