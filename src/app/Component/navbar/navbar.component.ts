import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../Service/user.service';
import { UserAuthService } from '../../Service/user-auth.service';


@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private router = inject(Router);
  private userAuthService = inject(UserAuthService);


  loggedIn = this.userAuthService.isLoggedIn()

  logOut() {
    this.userAuthService.clearLocalStorage()

  }
  navigateToProfileOrLogin(): void {
    const isLoggedIn = this.userAuthService.isLoggedIn();
    if (isLoggedIn) {
      if (this.userAuthService.getRoles().includes("ADMIN")) {
        this.router.navigate(['/admin']);
      }
      else if (this.userAuthService.getRoles().includes("USER")) {
        this.router.navigate(['/userdashbord'])
      }
    }
    else {
      this.router.navigate(['/login'])

    }

  }

  navigateToCartOrLogin() {


    const isLoggedIn = this.userAuthService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigate(['/cart'])
    } else {
      this.router.navigate(['/login'])
    }
  }
}

