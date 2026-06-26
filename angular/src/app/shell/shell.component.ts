import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/auth.service';
import { AuthStateService } from '../../auth/auth-state.service';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { ToolbarComponent } from '../../toolbar/toolbar.component';
import { SidenavService } from '../sidenav.service';

@Component({
  selector: 'app-shell',
  imports: [
    AsyncPipe,
    BreadcrumbComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ToolbarComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {

  @ViewChild('drawer') drawer?: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);

  readonly isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay({bufferSize: 1, refCount: true})
    );

  constructor(
    public authState: AuthStateService,
    private auth: AuthService,
    private sidenav: SidenavService
  ) {
    this.sidenav.observer
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.toggle());
  }

  toggle(): void {
    if (!this.drawer) {
      return;
    }
    void this.drawer.toggle();
    this.sidenav.setOpen(this.drawer.opened);
  }

  logout(): void {
    void this.auth.logout();
  }
}
