import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../Service/user.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { UserAuthService } from '../../Service/user-auth.service';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  private userService = inject(UserService);
  private userAuthService = inject(UserAuthService);
  private router = inject(Router);

  isLoading: boolean = true;
  hasProfile: boolean = false;
  user: any = {
    name: '',
    email: '',
    contactNumber: '',
    address: {
      address: '',
      pincode: '',
      city: '',
      state: ''
    }
  };

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.userService.login().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.user = response || {};
        this.user.address = this.user.address || { address: '', pincode: '', city: '', state: '' };
        this.hasProfile = Boolean(this.user.userImage && this.user.userImage !== 'null');
        if (this.user.email) {
          localStorage.setItem('username', this.user.email);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading user profile:', error);
      }
    });
  }

  getInitials(): string {
    if (!this.user?.name) return 'U';
    const parts = this.user.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.user.name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.userAuthService.clearLocalStorage();
    this.router.navigate(['/']);
  }

  deleteMyAccount(): void {
    Swal.fire({
      title: 'Delete Account?',
      text: "This action cannot be undone. All your details and order history will be removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete my account',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.delteMyAccont().subscribe({
          next: () => {
            Swal.fire({
              title: 'Account Deleted',
              text: 'Your account has been deleted.',
              icon: 'success',
              confirmButtonColor: '#1e3a2b'
            }).then(() => {
              this.logout();
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              title: 'Error!',
              text: 'There was an issue deleting your account. Please try again.',
              icon: 'error',
              confirmButtonColor: '#1e3a2b'
            });
          }
        });
      }
    });
  }
}
