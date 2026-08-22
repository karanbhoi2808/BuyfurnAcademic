import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../Service/user.service';
import { UserAuthService } from '../../Service/user-auth.service';
import { EmailService } from '../../Service/email.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  private userAuthService = inject(UserAuthService);
  private emailService = inject(EmailService);

  username: string = '';
  password: string = '';

  loading: boolean = false;
  loginMsg: string = '';
  loginError: boolean = false;

  login(): void {
    if (!this.username || !this.password) return;

    this.userAuthService.setUserEmail(this.username.trim());
    const authString = 'Basic ' + btoa(this.username.trim() + ':' + this.password);
    this.userAuthService.setBasicAuthString(authString);

    this.loading = true;
    this.loginError = false;
    this.loginMsg = '';

    this.userService.login().subscribe({
      next: (response) => {
        this.loading = false;
        const roles = response.roles;

        this.userAuthService.setRoles(roles);
        this.userAuthService.setUserName(response.name);
        this.userAuthService.setUserEmail(response.email);

        if (roles.includes('ADMIN')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.userAuthService.clearLocalStorage();
        this.loginError = true;
        if (error.status === 401) {
          this.loginMsg = 'Invalid email or password. Please check your credentials.';
        } else {
          this.loginMsg = 'Unable to sign in. Please verify your connection and try again.';
        }
      }
    });
  }

  EmailRequest: any = {
    to: '',
    subject: '',
    text: ''
  };

  forgotPassword(): void {
    if (!this.username || !this.username.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Enter Your Email',
        text: 'Please enter your registered email address above to receive an OTP.',
        confirmButtonColor: '#cca038'
      });
      return;
    }

    this.loginMsg = '';
    this.loading = true;

    this.userService.generateOtp(this.username.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.loginError = true;
        this.loginMsg = 'Email not found in our records.';
      },
      error: (HttpErrorResponse) => {
        this.loading = false;
        if (HttpErrorResponse.status === 302) {
          this.userAuthService.setUserEmail(this.username.trim());
          this.EmailRequest.to = this.username.trim();
          this.EmailRequest.subject = 'OTP to reset your BuyFurn password';
          this.EmailRequest.text = HttpErrorResponse.error;

          this.emailService.sendMail(this.EmailRequest).subscribe();
          this.router.navigate(['/forgot-password']);
        } else {
          this.loginError = true;
          this.loginMsg = 'Could not generate reset code. Please try again.';
          this.userAuthService.clearLocalStorage();
        }
      }
    });
  }
}
