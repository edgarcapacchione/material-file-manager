import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BrowseService } from '../../../browse/browse.service';
import { BackendService } from '../../../common/backend.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDivider, MatList, MatListItem } from '@angular/material/list';
import { FileViewerService } from '../../../common/file-viewer/file-viewer.service';

@Component({
  selector: 'app-search-dialog',
  imports: [
    FormsModule, 
    MatFormField, 
    MatInput, 
    MatButtonModule, 
    MatLabel, 
    MatDialogActions, 
    MatDialogContent, 
    MatIcon, 
    MatListItem, 
    MatList,
    MatDivider,
    AsyncPipe
  ],
  templateUrl: './search-dialog.html',
  styleUrl: './search-dialog.scss'
})
export class SearchDialog {

  str: string = '';
  
  private resultObserver = new BehaviorSubject<any[]>([]);
  result$: Observable<any[]> = this.resultObserver.asObservable();  

  constructor(
    private dialog: MatDialogRef<SearchDialog>, 
    private backend: BackendService, 
    private browseService: BrowseService,
    private snack: MatSnackBar,
    private fileViewer: FileViewerService
  ) {}

  close() {
    this.dialog.close();
  }

  typed(str: string): void {
    this.str = str;
    if (this.str.length < 3) {
      this.resultObserver.next([]);
      return;
    }
    this.backend.locate(this.browseService.getCurrentPath(), this.str)
      .subscribe({
        next: (result) => this.resultObserver.next(result),
        error: (e) => this.snack.open(e, 'OK')
      });
  }

  resultClicked(item: any): void {
    if (item.isFolder) {
      this.close();
      this.browseService.browseTo(item.path);
    } else {
      this.fileViewer.open(item.path);
    }
  }

}