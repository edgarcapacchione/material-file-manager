import { Injectable } from '@angular/core';
import { BackendService } from '../common/backend.service';
import { MatDialog } from '@angular/material/dialog';
import { BrowseService } from '../browse/browse.service';
import { CreateFolderDialog } from './dialog/create-folder/create-folder-dialog';
import { DeleteDialog } from './dialog/delete/delete-dialog';
import { RenameDialog } from './dialog/rename/rename-dialog';
import { CopyRenameDialog } from './dialog/copy-rename/copy-rename-dialog';
import { concatMap, from, map, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchDialog } from './dialog/search/search-dialog';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {

  public action: string = '';
  public searchStr: string = '';

  constructor(private browseService: BrowseService, private backend: BackendService, private dialog: MatDialog, private snack: MatSnackBar) {}

  createFolder(): void {
    this.dialog
      .open(CreateFolderDialog)
      .afterClosed()
      .subscribe(result => {
        if (!result) {
          return;
        }
        const dirName = `${this.browseService.getCurrentPath()}/${result}`;
        this.backend.mkdir(dirName).subscribe({
          next: () => this.browseService.refresh(),
          error: (e) => this.snack.open(e, 'OK')
        });
      });
  }

  rename(): void {
    if (this.browseService.getSelected().length != 1) {
      return;
    }
    const sel = this.browseService.getSelected()[0];
    const oldName = this.browseService.getFiles().find(f => f.id == sel).name;
    this.dialog
      .open(RenameDialog, {data: {dirName: oldName}})
      .afterClosed()
      .subscribe(result => {
        if (!result) {
          return;
        }
        const source = `${this.browseService.getCurrentPath()}/${oldName}`;
        const target = `${this.browseService.getCurrentPath()}/${result}`;
        this.backend.mv([source, target]).subscribe({
          next: () => this.browseService.refresh(),
          error: (e) => this.snack.open(e, 'OK')
        });
      });
  }
  
  copyToClipboard(action: string) {
    this.action = action;
    this.browseService.clearClipboard();
    (this.browseService.getSelected() || [])
      .forEach(c => {
        const file = this.browseService.getFiles().find(f => f.id == c);
        const source = `${this.browseService.getCurrentPath()}/${file.name}`;
        this.browseService.addToClipboard(source);
      });
    if (this.browseService.getClipboard().length > 1) {
      this.snack.open(`${this.browseService.getClipboard().length} elements copied to clipboard`, 'OK');
    } else if (this.browseService.getClipboard().length == 1) {
      const sel = this.browseService.getClipboard().map(c => c.substring(c.lastIndexOf('/') + 1))[0];
      this.snack.open(`"${sel}" copied to clipboard`, 'OK');
    }
  }

  paste(): void {
    const clipboard = this.browseService.getClipboard();
    const payload: { source: string, target: string | null }[] = [];
    from(clipboard).pipe(
      concatMap(s => {
        const sourceName = s.substring(s.lastIndexOf('/') + 1);
        const currentPathFiles = this.browseService.getFiles().map(f => f.name);
        const t = this.browseService.getItemAbsolutePath(sourceName);
        if (!currentPathFiles.includes(sourceName)) {
          // nessun conflitto - non sono presenti altri file/cartelle con lo stesso nome nel path corrente
          return of({source: s, target: t});
        }
        if (s == t && this.action == 'cut') {
          // sto tagliando e incollando nello stesso path -> skippo la chiamata
          return of({source: s, target: null});
        }
        // altrimenti richiedo nuovo nome
        return this.dialog
          .open(CopyRenameDialog, {data: {sourceName}})
          .afterClosed()
          .pipe(
            map(targetName => ({source: s, target: targetName ? this.browseService.getItemAbsolutePath(targetName) : null}))
          );
      })
    ).subscribe({
      next: (result: {source: string, target: string | null}) => {
        if (!result.target) {
          // premuto skip
          return;
        }
        // nuovo nome
        payload.push(result);
      },
      complete: () => {
        if (payload.length == 0) {
          // payload vuoto skippo la chiamata BE
          if (this.action == 'cut') {
            // se sto skippando un taglio pulisco la clipboard
            this.browseService.clearClipboard();
          }
        } else {
          if (this.action == 'copy') {
            this.backend.cp(payload).subscribe({
              next: () => this.browseService.refresh(),
              error: (e) => this.snack.open(e, 'OK')
            });
          } else if (this.action == 'cut') {
            this.backend.mv(payload).subscribe({
              next: () => this.browseService.refresh(),
              error: (e) => this.snack.open(e, 'OK')
            });
          } else {
            return;
          }
        }
      },
      error: e => this.snack.open(e, 'OK')
    });
  }

  delete(): void {
    if (this.browseService.getSelected().length == 0) {
      return;
    }
    let selNames: string[] = [];
    this.browseService.getSelected().forEach(id => {
      const file = this.browseService.getFiles().find(f => f.id == id);
      selNames.push(file.name);
    });
    this.dialog
      .open(DeleteDialog, {data: {selNames: selNames}})
      .afterClosed()
      .subscribe(result => {
        if (!result) {
          return;
        }
        const targets = selNames.map(sn => `${this.browseService.getCurrentPath()}/${sn}`);
        this.backend.rm(targets).subscribe({
          next: () => this.browseService.refresh(),
          error: (e) => this.snack.open(e, 'OK')
        });
      });
  }

  search(): void {
    this.dialog.open(SearchDialog)
  }
}
