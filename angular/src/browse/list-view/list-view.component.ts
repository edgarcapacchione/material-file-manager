import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { FileSizePipe } from '../../common/file-size.pipe';
import { BrowseService } from '../browse.service';
import { FileNamePipe } from '../../common/file-name.pipe';
import { ToolbarService } from '../../toolbar/toolbar.service';

@Component({
  selector: 'app-list-view',
  imports: [MatIconModule, CommonModule, /*AsyncPipe,*/ MatTableModule, MatSortModule, FileSizePipe, DatePipe, FileNamePipe],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss'
})
export class ListViewComponent {

  @ViewChild(MatSort) sort!: MatSort;

  public dataSource: MatTableDataSource<any, MatPaginator> = new MatTableDataSource();  
  public columns: string[] = ['name', 'lastModifiedDate', 'type', 'size'];

  @Output() browseEvent = new EventEmitter<any>();
  
  private destroy$ = new Subject<void>();  

  constructor(public browseService: BrowseService, public toolbarService: ToolbarService) {}

  ngAfterViewInit(): void {
    this.initDataSource();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initDataSource(): void {
    this.dataSource.sort = this.sort;
    this.listenFilesChanges();
  }

  listenFilesChanges(): void {
    this.browseService.filesChangedObserver
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.dataSource.data = this.browseService.getFiles());
  }

  browse(element: any): void {
    this.browseEvent.next(element);
  }

}
