import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BrowseService } from '../../../browse/browse.service';
@Component({
  selector: 'app-rename-dialog',
  imports: [
    FormsModule, MatFormField, MatInput, MatButtonModule, MatLabel, MatDialogActions, MatDialogContent
  ],
  templateUrl: './rename-dialog.html',
  styleUrl: './rename-dialog.scss'
})
export class RenameDialog {

  dirName: string;
  fileNames: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) 
    public input: {dirName: string}, 
    public browseService: BrowseService,
    private dialog: MatDialogRef<RenameDialog>
  ) {
    this.dirName = this.input.dirName;
    this.fileNames = this.browseService.getFiles().map(f => f.name);
  }

  cancel() {
    this.dialog.close();
  }

  ok() {
    this.dialog.close(this.dirName);
  }

}