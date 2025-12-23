import { Pipe, PipeTransform } from '@angular/core';
import { BrowseService } from '../browse/browse.service';

@Pipe({
  name: 'fileName',
  pure: false
})
export class FileNamePipe implements PipeTransform {

  constructor(private browseService: BrowseService){}

  transform(element: any): string {
    switch (this.browseService.getMode()) {
      case 'grid':
        if (this.browseService.isSelected(element.id) || element.name.length < 10) {
          return element.name;
        } else {
          return `${element.name.substring(0, 10)}...`
        }
      case 'list':
        return element.name; // TODO define list view naming
      default:
        return element.name;    
    }
  }

}
