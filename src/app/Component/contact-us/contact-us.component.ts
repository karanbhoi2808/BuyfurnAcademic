import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  isSubmitting: boolean = false;

  formData = {
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  sendMessage(form: NgForm): void {
    if (form.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Fields',
        text: 'Please fill in all the required fields.',
        confirmButtonColor: '#cca038'
      });
      return;
    }

    this.isSubmitting = true;

    // Simulate sending message
    setTimeout(() => {
      this.isSubmitting = false;
      Swal.fire({
        title: 'Message Sent!',
        text: 'Thank you for reaching out. Our concierge team will get back to you within 24 hours.',
        icon: 'success',
        confirmButtonColor: '#1e3a2b'
      });
      form.resetForm();
    }, 800);
  }
}
