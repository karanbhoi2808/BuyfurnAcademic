import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../Service/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-user',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  isLoading: boolean = true;
  isSubmitting: boolean = false;

  user: any = {
    name: '',
    email: '',
    address: {
      address: '',
      pincode: '',
      city: '',
      state: ''
    },
    contactNumber: ''
  };

  newAddress: any = {
    address: '',
    pincode: '',
    city: '',
    state: ''
  };

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    const username = localStorage.getItem('email') || localStorage.getItem('username');

    if (username) {
      this.userService.findByEmail(username).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.setUserData(response);
        },
        error: () => {
          // Fallback to login profile fetch
          this.userService.login().subscribe({
            next: (loginResp) => {
              this.isLoading = false;
              this.setUserData(loginResp);
            },
            error: (err) => {
              this.isLoading = false;
              console.error(err);
            }
          });
        }
      });
    } else {
      this.userService.login().subscribe({
        next: (loginResp) => {
          this.isLoading = false;
          this.setUserData(loginResp);
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
        }
      });
    }
  }

  private setUserData(data: any): void {
    if (data) {
      this.user = data;
      this.newAddress = {
        address: data.address?.address || '',
        pincode: data.address?.pincode || '',
        city: data.address?.city || '',
        state: data.address?.state || ''
      };
    }
  }

  onSubmit(): void {
    this.user.address = this.newAddress;
    this.isSubmitting = true;

    if (this.user && this.user.email) {
      this.userService.updateUser(this.user).subscribe({
        next: () => {
          this.isSubmitting = false;
          Swal.fire({
            title: 'Profile Updated!',
            text: 'Your profile information has been saved successfully.',
            icon: 'success',
            confirmButtonColor: '#1e3a2b'
          }).then(() => {
            this.router.navigate(['/userprofile']);
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error(error);
          Swal.fire({
            title: 'Update Failed',
            text: 'There was an issue updating your details. Please try again.',
            icon: 'error',
            confirmButtonColor: '#1e3a2b'
          });
        }
      });
    }
  }
}
