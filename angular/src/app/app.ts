import { Component, inject, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { SidenavService } from './sidenav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToolbarComponent,
    BreadcrumbComponent,
    RouterModule
  ]
})
export class App {
  
  @ViewChild('drawer') drawer!: MatSidenav;
  
  private breakpointObserver = inject(BreakpointObserver);
  public isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches), shareReplay());

  constructor(private router: Router, private sidenav: SidenavService) {
    this.sidenav.observer.subscribe(() => {
      this.drawer.toggle();
      this.sidenav.setOpen(this.drawer.opened);
    });
  }

  ngOnInit(): void {
    this.router.navigate(['/browse']);
  }

  toggle(): void {
    this.sidenav.toggle(!this.drawer.opened);
  }

}
