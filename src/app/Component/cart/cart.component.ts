import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../Service/product.service';
import { Router, RouterLink } from '@angular/router';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, OrderSummaryComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  isLoading: boolean = true;
  products: any[] = [];
  isNoProducts: boolean = false;

  ngOnInit(): void {
    this.getCartDetails();
  }

  getCartDetails(): void {
    this.isLoading = true;
    this.productService.getCartDetails().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.products = response || [];
        this.isNoProducts = this.products.length === 0;
      },
      error: (error) => {
        this.isLoading = false;
        this.isNoProducts = true;
        console.error('Error fetching cart details:', error);
      }
    });
  }

  calculateSubtotal(): number {
    if (!this.products || this.products.length === 0) return 0;
    return this.products.reduce((acc, item) => acc + (item.product?.price || 0), 0);
  }

  viewProduct(productId: any): void {
    if (productId) {
      this.router.navigate(['/product'], {
        queryParams: { productId: productId }
      });
    }
  }

  checkOut(): void {
    this.router.navigate(['/buyproduct'], {
      queryParams: {
        isSingleProductCheckout: false,
        id: 0
      }
    });
  }

  removeProduct(id: any): void {
    Swal.fire({
      title: 'Remove Item?',
      text: 'Are you sure you want to remove this piece from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#cca038',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.removeCartProduct(id).subscribe({
          next: () => {
            this.getCartDetails();
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
            Toast.fire({
              icon: 'success',
              title: 'Product removed from cart'
            });
          },
          error: (error) => {
            console.error(error);
          }
        });
      }
    });
  }
}
