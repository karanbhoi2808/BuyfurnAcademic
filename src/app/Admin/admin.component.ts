import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SrvRecord } from 'dns';
import { UserAuthService } from '../Service/user-auth.service';

@Component({
    selector: 'app-admin',
    imports: [RouterOutlet, RouterLink],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css'
})
export class AdminComponent {
  private userAuthservice = inject(UserAuthService);


  user = this.userAuthservice.getUserName();

  logOut() {
    this.userAuthservice.clearLocalStorage()
  }
}
