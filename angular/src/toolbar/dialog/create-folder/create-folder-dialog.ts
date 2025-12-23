import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BrowseService } from '../../../browse/browse.service';

@Component({
  selector: 'app-create-folder-dialog',
  imports: [
    FormsModule, MatFormField, MatInput, MatButtonModule, MatLabel, MatDialogActions, MatDialogContent
  ],
  templateUrl: './create-folder-dialog.html',
  styleUrl: './create-folder-dialog.scss'
})
export class CreateFolderDialog {

  dirName: string = '';
  fileNames: string[] = [];

  constructor(private dialog: MatDialogRef<CreateFolderDialog>, private browseService: BrowseService) {
    this.fileNames = this.browseService.getFiles().map(f => f.name);
  }

  cancel() {
    this.dialog.close();
  }

  ok() {
    this.dialog.close(this.dirName);
  }

}