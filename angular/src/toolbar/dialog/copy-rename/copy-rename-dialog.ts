import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BrowseService } from '../../../browse/browse.service';
@Component({
  selector: 'app-copy-rename-dialog',
  imports: [
    FormsModule, MatFormField, MatInput, MatButtonModule, MatLabel, MatDialogActions, MatDialogContent
  ],
  templateUrl: './copy-rename-dialog.html',
  styleUrl: './copy-rename-dialog.scss'
})
export class CopyRenameDialog {

  targetName: string;
  fileNames: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) 
    public input: {sourceName: string}, 
    public browseService: BrowseService,
    private dialog: MatDialogRef<CopyRenameDialog>
  ) {
    this.targetName = this.input.sourceName;
    this.fileNames = this.browseService.getFiles().map(f => f.name);
  }

  skip() {
    this.dialog.close();
  }

  ok() {
    this.dialog.close(this.targetName);
  }

}