import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileFilter',
  pure: false
})
export class FileFilterPipe implements PipeTransform {

  constructor() {}

  transform(filesList: any[] | null, files: boolean = true, folders: boolean = true): any[] {
    if (!filesList) {
      return [];
    }
    return filesList.filter(f => files && !f.isFolder || folders && f.isFolder);
  }

}
