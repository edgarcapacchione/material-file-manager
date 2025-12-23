import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileViewer } from './file-viewer.component';
import { MatDialog } from '@angular/material/dialog';
import { BackendService } from '../backend.service';
import { BrowseService } from '../../browse/browse.service';

@Injectable({
  providedIn: 'root'
})
export class FileViewerService {

  private dialogConfig: any = {
    width: '100%', 
    height: '100%', 
    maxWidth: '100%', 
    maxHeight: '100%',
    panelClass: 'file-viewer-dialog'
  };

  private resultObserver: BehaviorSubject<any> = new BehaviorSubject('');
  private result$: Observable<any> = this.resultObserver.asObservable();

  private layoutObserver: BehaviorSubject<string> = new BehaviorSubject('');
  private layout$: Observable<any> = this.layoutObserver.asObservable();
  
  constructor(private dialog: MatDialog, private backend: BackendService, private browseSerivice: BrowseService) {}

  open(filePath: string): void {
    this.dialog.open(FileViewer, this.dialogConfig);
    this.fetchContent(filePath);
  }

  switch(next: string): void {
    this.resultObserver = new BehaviorSubject('');
    this.result$ = this.resultObserver.asObservable();
    this.fetchContent(this.browseSerivice.getItemAbsolutePath(next));
  }

  observe(): Observable<any> {
    return this.result$;
  }

  observeLayout(): Observable<string> {
    return this.layout$;
  }

  clean(): void {
    this.layoutObserver = new BehaviorSubject('');
    this.resultObserver = new BehaviorSubject('');
    this.layout$ = this.layoutObserver.asObservable();
    this.result$ = this.resultObserver.asObservable();
  }

  private fetchContent(fileName: string): void {
    this.backend.cat(fileName).subscribe({
      next: (result) => {
        if (result.type === 'application/pdf') {
          this.resultObserver.next(URL.createObjectURL(result));
          this.layoutObserver.next('pdf');
        } else {
          result.text().then((content: string) => this.resultObserver.next(content));
          this.layoutObserver.next('code-editor');
        }
        // else if (result.type.startsWith('image/')) {
        //   this.imgSrc = URL.createObjectURL(result);
        // }
        // // fallback -> download
        // else {
        //   const fileURL = URL.createObjectURL(result);
        //   const a = document.createElement('a');
        //   a.href = fileURL;
        //   a.download = 'download';
        //   a.click();
        // }
      }/*,
      error: (e) => TODO */
    });
  }

}
