
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductService } from '../../Service/product.service';

export interface ImagePreviewItem {
  file: File;
  url: string;
  name: string;
  size: string;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
  private productService = inject(ProductService);
  private router = inject(Router);

  categories: string[] = [
    'Living Room',
    'Bedroom',
    'Dining Room',
    'Office Furniture',
    'Outdoor Furniture',
    'Storage Solutions'
  ];

  stockOptions: string[] = ['In Stock', 'In Stock soon', 'Out of Stock'];

  product: any = {
    title: '',
    description: '',
    price: null,
    warranty: '',
    category: '',
    color: '',
    material: '',
    seatingCapacity: null,
    weight: null,
    careAndMaintenance: '',
    stockStatus: 'In Stock'
  };

  selectedFiles: File[] = [];
  imagePreviews: ImagePreviewItem[] = [];
  isDragging: boolean = false;
  isSubmitting: boolean = false;

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  handleFiles(files: FileList | File[]): void {
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      // Validate image format
      if (!file.type.startsWith('image/')) {
        Swal.fire('Invalid File', `${file.name} is not a valid image.`, 'warning');
        return;
      }

      // Check max size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire('File Too Large', `${file.name} exceeds the 10MB limit.`, 'warning');
        return;
      }

      // Avoid duplicates
      const exists = this.selectedFiles.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (!exists) {
        this.selectedFiles.push(file);
        const url = URL.createObjectURL(file);
        const sizeFormatted = this.formatFileSize(file.size);
        this.imagePreviews.push({
          file,
          url,
          name: file.name,
          size: sizeFormatted
        });
      }
    });
  }

  removeImage(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const item = this.imagePreviews[index];
    if (item && item.url) {
      URL.revokeObjectURL(item.url);
    }
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.selectedFiles.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Images Required',
        text: 'Please select or upload at least one product image.'
      });
      return;
    }

    if (!this.product.title || !this.product.price || !this.product.category || !this.product.description) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        text: 'Please provide Title, Price, Category and Description.'
      });
      return;
    }

    this.isSubmitting = true;

    this.productService.addProduct(this.product, this.selectedFiles).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Product Created!',
          text: `"${this.product.title}" has been successfully added.`,
          timer: 2000,
          showConfirmButton: false
        });
        this.resetForm();
        this.router.navigateByUrl('/admin/product');
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error adding product:', error);
        Swal.fire({
          icon: 'error',
          title: 'Publish Failed',
          text: 'Error adding product. Please verify fields and try again.'
        });
      }
    });
  }

  resetForm(): void {
    const fileInput: HTMLInputElement = document.getElementById('productImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.product = {
      title: '',
      description: '',
      price: null,
      warranty: '',
      category: '',
      color: '',
      material: '',
      seatingCapacity: null,
      weight: null,
      careAndMaintenance: '',
      stockStatus: 'In Stock'
    };
  }
}
