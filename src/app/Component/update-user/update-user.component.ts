import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../Service/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-update-user',
    imports: [FormsModule],
    templateUrl: './update-user.component.html',
    styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

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

  onSubmit() {
    this.user.address = this.newAddress;
    if (this.user && this.user.email) {
      this.userService.updateUser(this.user).subscribe(
        response => {
          Swal.fire("Your information is updated");
          this.router.navigate(['/userprofile']);
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  ngOnInit(): void {
    this.findByEmail();
  }

  findByEmail() {
    const username = localStorage.getItem('email');
    if (username) {
      this.userService.findByEmail(username).subscribe(
        response => {
          this.user = response || {};
          if (this.user.address) {
            this.newAddress = {
              address: this.user.address.address || '',
              pincode: this.user.address.pincode || '',
              city: this.user.address.city || '',
              state: this.user.address.state || ''
            };
          }
        },
        error => {
          console.log(error);
        }
      );
    } else {
      console.log('Username is null or undefined');
    }
  }
}
