import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  
  private sizeUnits: string[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  private sizeBase: number = 1024;

  transform(bytes: number | null | undefined): string {
    if (!bytes || bytes == 0) {
      return '0 B';
    }
    let found = false;
    let formatted = bytes;
    let index = 0;
    while (!found) {
      if (formatted < this.sizeBase) {
        found = true;
      } else {
        formatted /= this.sizeBase;
        index++;
      }
    }
    return `${parseFloat(formatted.toFixed(2))} ${this.sizeUnits[index]}`;
  }

}
