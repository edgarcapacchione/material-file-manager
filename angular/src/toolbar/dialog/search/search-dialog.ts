import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BrowseService } from '../../../browse/browse.service';
import { BackendService } from '../../../common/backend.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, catchError, distinctUntilChanged, Observable, of, Subject, switchMap, timer } from 'rxjs';
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

  private destroyRef = inject(DestroyRef);
  private searchTerms = new Subject<string>();
  private resultObserver = new BehaviorSubject<any[]>([]);
  result$: Observable<any[]> = this.resultObserver.asObservable();

  constructor(
    private dialog: MatDialogRef<SearchDialog>, 
    private backend: BackendService, 
    private browseService: BrowseService,
    private snack: MatSnackBar,
    private fileViewer: FileViewerService
  ) {
    this.searchTerms.pipe(
      distinctUntilChanged(),
      switchMap(str => {
        if (str.length < 3) {
          return of([]);
        }
        return timer(300).pipe(
          switchMap(() => this.backend.locate(this.browseService.getCurrentPath(), str)),
          catchError(e => {
            this.snack.open(e, 'OK');
            return of([]);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => this.resultObserver.next(result));
  }

  close() {
    this.dialog.close();
  }

  typed(str: string): void {
    this.str = str.trim();
    this.searchTerms.next(this.str);
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
