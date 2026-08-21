import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../Service/product.service';
import { UserAuthService } from '../../Service/user-auth.service';
import { SimilarProductsComponent } from '../similar-products/similar-products.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);
  private authService = inject(UserAuthService);

  product: any = null;
  productId: string | null = null;
  currentSlide: number = 0;
  quantity: number = 1;
  isLoading = true;
  productNotAvailable: boolean = false;
  isFavorite: boolean = false;
  isSpecsOpen: boolean = true;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['productId'];
      if (id) {
        this.productId = id;
        this.loadProduct(id);
      } else {
        // Fallback to route data if available
        this.route.data.subscribe((response: any) => {
          if (response && response.productDetails) {
            this.setProduct(response.productDetails);
          } else {
            this.productNotAvailable = true;
            this.isLoading = false;
          }
        });
      }
    });
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.productNotAvailable = false;
    this.currentSlide = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.productService.getProductById(id).subscribe({
      next: (data) => {
        if (data) {
          this.setProduct(data);
        } else {
          this.productNotAvailable = true;
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.productNotAvailable = true;
        this.isLoading = false;
      }
    });
  }

  setProduct(prod: any): void {
    this.product = prod;
    this.isLoading = false;
    this.productNotAvailable = false;
    this.currentSlide = 0;
  }

  selectSlide(index: number): void {
    this.currentSlide = index;
  }

  nextSlide(): void {
    if (this.product?.productImages?.length) {
      this.currentSlide = (this.currentSlide + 1) % this.product.productImages.length;
    }
  }

  prevSlide(): void {
    if (this.product?.productImages?.length) {
      this.currentSlide = (this.currentSlide - 1 + this.product.productImages.length) % this.product.productImages.length;
    }
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
    Toast.fire({
      icon: 'success',
      title: this.isFavorite ? 'Added to wishlist' : 'Removed from wishlist'
    });
  }

  toggleSpecs(): void {
    this.isSpecsOpen = !this.isSpecsOpen;
  }

  viewProduct(id: any): void {
    this.router.navigate(['/product'], {
      queryParams: { productId: id }
    });
  }

  addToCart(cartId: any): void {
    const roles = this.authService.getRoles();
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/forbidden']);
      return;
    }

    if (this.product.stockStatus === 'In Stock') {
      this.productService.addToCart(cartId, this.quantity).subscribe({
        next: () => {
          Swal.fire({
            title: 'Added to Cart!',
            text: `${this.product.title} has been added to your cart.`,
            icon: 'success',
            confirmButtonColor: '#cca038'
          });
        },
        error: (error) => {
          console.error(error);
          if (error.status === 500) {
            window.location.reload();
          }
        }
      });
    } else if (this.product.stockStatus === 'Out of Stock' || this.product.stockStatus === 'In Stock soon') {
      Swal.fire({
        title: 'Out of Stock',
        text: 'This product is currently not in stock.',
        icon: 'warning',
        confirmButtonColor: '#cca038',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        title: 'Try again later',
        icon: 'error',
        confirmButtonColor: '#cca038',
        confirmButtonText: 'OK'
      });
    }
  }

  buyNow(productId: any): void {
    if (this.product.stockStatus === 'In Stock') {
      this.router.navigate(['/buyproduct'], {
        queryParams: {
          isSingleProductCheckout: true,
          id: productId
        }
      });
    } else if (this.product.stockStatus === 'Out of Stock' || this.product.stockStatus === 'In Stock soon') {
      Swal.fire({
        title: 'Out of Stock',
        text: 'This product is currently not in stock.',
        icon: 'warning',
        confirmButtonColor: '#cca038',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        title: 'Try again later',
        icon: 'error',
        confirmButtonColor: '#cca038',
        confirmButtonText: 'OK'
      });
    }
  }
}
