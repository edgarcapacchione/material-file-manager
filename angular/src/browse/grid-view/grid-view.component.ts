import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowseService } from '../browse.service';
import { MatMenuModule } from '@angular/material/menu';
import { FileNamePipe } from '../../common/file-name.pipe';
import { ToolbarService } from '../../toolbar/toolbar.service';

@Component({
  selector: 'app-grid-view',
  imports: [MatMenuModule, MatIconModule, CommonModule, AsyncPipe, DragDropModule, FileNamePipe],
  templateUrl: './grid-view.component.html',
  styleUrl: './grid-view.component.scss'
})
export class GridViewComponent {

  @Output() browseEvent = new EventEmitter<any>();

  constructor(public browseService: BrowseService, public toolbarService: ToolbarService) {}

  browse(element: any): void {
    this.browseEvent.next(element);
  }

}
