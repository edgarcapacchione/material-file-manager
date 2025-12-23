import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BrowseService } from './browse.service';
import { DragselectService } from '../common/dragselect.service';
import { GridViewComponent } from './grid-view/grid-view.component';
import { ListViewComponent } from './list-view/list-view.component';
import { FileViewerService } from '../common/file-viewer/file-viewer.service';
import { ToolbarService } from '../toolbar/toolbar.service';

@Component({
  selector: 'app-browse',
  imports: [MatMenuModule, MatIconModule, CommonModule, GridViewComponent, ListViewComponent],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent {

  constructor(public browseService: BrowseService, private dragSelect: DragselectService, private fileViewer: FileViewerService, public toolbarService: ToolbarService) {}

  ngOnInit(): void {
    this.browseService.init();
    this.dragSelect.init();
  }

  ngOnDestroy(): void {
    this.dragSelect.stop();
    this.browseService.clean();
  }

  browse(element: any): void { 
    if (element.isFolder) {
      this.browseService.browseUp(element.name);
    } else {
      this.fileViewer.open(this.browseService.getItemAbsolutePath(element.name));
    }
  }

}
