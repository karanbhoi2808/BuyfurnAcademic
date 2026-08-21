import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../Service/user.service';
import { UserAuthService } from '../../Service/user-auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  private userservice = inject(UserService);
  private router = inject(Router);
  private userAuthService = inject(UserAuthService);

  verificationError: boolean = false;
  loading: boolean = false;
  displayPassword: boolean = false;

  email: string = '';
  otp: string = '';
  newPassword: string = '';

  user: any = {
    email: '',
    pasword: ''
  };

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.email = this.userAuthService.getUserEmail() || '';
    }
  }

  verifyOtp(): void {
    if (!this.otp || !this.otp.trim()) return;

    this.loading = true;
    this.verificationError = false;

    this.userservice.verifyOtp(this.email, this.otp.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        if (response === true) {
          this.verificationError = false;
          this.displayPassword = true;
        } else {
          this.verificationError = true;
        }
      },
      error: (error) => {
        this.loading = false;
        this.verificationError = true;
        console.error('OTP verification error:', error);
      }
    });
  }

  updatePassword(): void {
    if (!this.newPassword || !this.newPassword.trim()) return;

    this.user.email = this.email;
    this.user.pasword = this.newPassword;
    this.loading = true;

    this.userservice.updatePassword(this.user).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Password Updated!',
          text: 'Your password has been successfully reset. Please login with your new password.',
          confirmButtonColor: '#1e3a2b',
          confirmButtonText: 'Proceed to Login'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        this.loading = false;
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating your password. Please try again.',
          confirmButtonColor: '#1e3a2b'
        });
      }
    });
  }
}
