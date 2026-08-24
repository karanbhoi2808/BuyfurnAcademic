import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserAuthService } from '../Service/user-auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private userAuthservice = inject(UserAuthService);

  user = this.userAuthservice.getUserName();

  logOut() {
    this.userAuthservice.clearLocalStorage();
  }
}

