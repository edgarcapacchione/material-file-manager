import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  imports: [
    MatButtonModule, MatDialogActions, MatDialogContent
  ],
  templateUrl: './delete-dialog.html',
  styleUrl: './delete-dialog.scss'
})
export class DeleteDialog {

  selNames: string[];

  constructor(private dialog: MatDialogRef<DeleteDialog>, @Inject(MAT_DIALOG_DATA) public input: {selNames: string[]}) {
    this.selNames = this.input.selNames;
  }

  cancel() {
    this.dialog.close();
  }

  ok() {
    this.dialog.close(this.selNames);
  }

}