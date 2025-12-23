import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { CodeEditorComponent } from '@fsegurai/ngx-codemirror';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { FileViewerService } from './file-viewer.service';
import { oneDark } from '@codemirror/theme-one-dark';
import { SafePipe } from '../safe.pipe';

@Component({
  selector: 'app-file-viewer',
  imports: [
    FormsModule, MatButtonModule, MatDialogActions, MatDialogContent, MatIcon, CodeEditorComponent, AsyncPipe, SafePipe
  ],
  templateUrl: './file-viewer.component.html',
  styleUrl: './file-viewer.component.scss'
})
export class FileViewer {
  
  codeEditorTheme = oneDark;

  constructor(private dialog: MatDialogRef<FileViewer>, public viewerService: FileViewerService) {}

  ngOnDestroy(): void {
    this.viewerService.clean();
  }

  back(): void {
    this.dialog.close();
  }

  left(): void {

  }

  right(): void {
    
  }
}