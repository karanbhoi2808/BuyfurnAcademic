import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../Service/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-otp',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css'
})
export class OtpComponent implements OnInit {
  private userservice = inject(UserService);
  private router = inject(Router);

  verificationError: boolean = false;
  loading: boolean = false;

  email: string = '';
  otp: string = '';

  user: any = {
    name: '',
    email: '',
    pasword: ''
  };

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.email = localStorage.getItem('email') || '';
    }
  }

  verifyOtp(): void {
    if (!this.otp || !this.otp.trim()) return;

    this.loading = true;
    this.verificationError = false;

    this.userservice.verifyOtp(this.email, this.otp.trim()).subscribe({
      next: (response) => {
        if (response === true) {
          if (typeof localStorage !== 'undefined') {
            this.user.email = localStorage.getItem('email');
            this.user.name = localStorage.getItem('name');
            this.user.pasword = localStorage.getItem('pasword');

            this.userservice.register(this.user).subscribe({
              next: () => {
                this.loading = false;
                localStorage.clear();
                Swal.fire({
                  icon: 'success',
                  title: 'Account Created!',
                  text: 'Your email has been verified and your account is ready. Please sign in.',
                  confirmButtonColor: '#1e3a2b',
                  confirmButtonText: 'Proceed to Login'
                }).then(() => {
                  this.router.navigate(['/login']);
                });
              },
              error: (err) => {
                this.loading = false;
                console.error(err);
                Swal.fire({
                  icon: 'error',
                  title: 'Registration Error',
                  text: 'Could not complete registration. Please try again.',
                  confirmButtonColor: '#1e3a2b'
                });
              }
            });
          }
        } else {
          this.verificationError = true;
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        this.verificationError = true;
        console.error(error);
      }
    });
  }
}
