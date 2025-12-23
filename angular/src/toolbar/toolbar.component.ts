import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { BrowseService } from '../browse/browse.service';
import { MatDividerModule } from '@angular/material/divider';
import { SidenavService } from '../app/sidenav.service';
import { ToolbarService } from './toolbar.service';

@Component({
  selector: 'app-toolbar',
  imports: [
    MatMenuModule, MatIconModule, MatButtonModule, MatToolbarModule, MatDividerModule, AsyncPipe
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  
  private breakpointObserver = inject(BreakpointObserver);
  public isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches), shareReplay());
  
  constructor(public sidenav: SidenavService, public browseService: BrowseService, public toolbarService: ToolbarService) {} 

  goBack(): void {
    this.browseService.browseBack();
  }

  goForward(): void {
    this.browseService.browseForward();
  }

  refresh(): void {
    this.browseService.refresh();
  }

  getSelected(selectedList: number[] | null, filesList: any[] | null): string {
    if (!!selectedList && selectedList?.length > 0) {
      if (selectedList?.length > 1) {
        return `${selectedList?.length} elements selected`;
      } else {
        return filesList?.find(f => f.id == selectedList[0]).name;
      }
    } 
    return '';
  }

}