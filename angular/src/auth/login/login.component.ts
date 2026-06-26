import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { AuthStateService } from '../auth-state.service';

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  readonly oauthError: boolean;

  constructor(
    public authState: AuthStateService,
    private auth: AuthService,
    route: ActivatedRoute
  ) {
    this.oauthError = route.snapshot.queryParamMap.has('error');
  }

  login(): void {
    this.auth.login();
  }
}
