import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductService } from '../../Service/product.service';
import { Product } from '../../Interface/product';

export interface ImagePreviewItem {
  file: File;
  url: string;
  name: string;
  size: string;
}

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
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
    id: null,
    title: '',
    description: '',
    price: null,
    warranty: '',
    productImages: [],
    category: '',
    color: '',
    material: '',
    seatingCapacity: null,
    weight: null,
    careAndMaintenance: '',
    stockStatus: 'In Stock'
  };

  productId: string | null = null;
  selectedFiles: File[] = [];
  newImagePreviews: ImagePreviewItem[] = [];
  isLoadingProduct: boolean = false;
  isSubmitting: boolean = false;
  isDragging: boolean = false;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productId = params['id'];
      if (this.productId) {
        this.loadProductDetails(this.productId);
      }
    });
  }

  loadProductDetails(id: string): void {
    this.isLoadingProduct = true;
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        this.isLoadingProduct = false;
        this.product = response;
        if (!this.product.stockStatus) {
          this.product.stockStatus = 'In Stock';
        }
      },
      error: (error) => {
        this.isLoadingProduct = false;
        console.error('Error fetching product:', error);
        Swal.fire('Error', 'Unable to load product information.', 'error');
      }
    });
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  handleFiles(files: FileList | File[]): void {
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Invalid File', `${file.name} is not a valid image.`, 'warning');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        Swal.fire('File Too Large', `${file.name} exceeds the 10MB limit.`, 'warning');
        return;
      }

      const exists = this.selectedFiles.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (!exists) {
        this.selectedFiles.push(file);
        const url = URL.createObjectURL(file);
        const sizeFormatted = this.formatFileSize(file.size);
        this.newImagePreviews.push({
          file,
          url,
          name: file.name,
          size: sizeFormatted
        });
      }
    });
  }

  removeNewImage(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const item = this.newImagePreviews[index];
    if (item && item.url) {
      URL.revokeObjectURL(item.url);
    }
    this.newImagePreviews.splice(index, 1);
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
    if (!this.product.title || !this.product.price || !this.product.category) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        text: 'Please ensure Title, Price, and Category are filled.'
      });
      return;
    }

    this.isSubmitting = true;

    this.productService.updateProduct(this.product, this.selectedFiles).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Product Updated!',
          text: `"${this.product.title}" has been updated successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/admin/product']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating product:', error);
        Swal.fire('Update Failed', 'Failed to update product details. Try again.', 'error');
      }
    });
  }
}

