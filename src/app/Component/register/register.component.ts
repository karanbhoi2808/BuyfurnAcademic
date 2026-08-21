import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../Service/user.service';
import { User } from '../../Interface/user';
import { EmailService } from '../../Service/email.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  private emailService = inject(EmailService);

  EmailRequest: any = {
    to: '',
    subject: '',
    text: ''
  };

  user: User = {
    name: '',
    email: '',
    pasword: '',
  };

  loading: boolean = false;
  registrationError: boolean = false;
  emailIdExits: boolean = false;

  generateOtp(): void {
    if (!this.user.name || !this.user.email || !this.user.pasword) return;

    this.loading = true;
    this.registrationError = false;
    this.emailIdExits = false;

    this.userService.generateOtp(this.user.email.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('email', this.user.email.trim());
          localStorage.setItem('name', this.user.name);
          localStorage.setItem('pasword', this.user.pasword);

          this.EmailRequest.to = this.user.email.trim();
          this.EmailRequest.subject = 'OTP to verify your email - BuyFurn';
          this.EmailRequest.text = response;

          this.emailService.sendMail(this.EmailRequest).subscribe();
          this.router.navigate(['/verify-otp']);
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 302) {
          this.emailIdExits = true;
        } else {
          this.registrationError = true;
        }
      }
    });
  }
}
