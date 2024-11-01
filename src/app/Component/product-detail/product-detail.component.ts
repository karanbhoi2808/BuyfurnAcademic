import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../Service/product.service';
import e, { response } from 'express';
import { error } from 'console';
import { UserAuthService } from '../../Service/user-auth.service';
import { LoadingComponent } from '../loading/loading.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {

  product: any;
  productId: string | null = null;
  currentSlide: number = 0;
  quantity: number = 1;
  isLoading = true;
  productNotAvailable: boolean = false
  constructor(private route: ActivatedRoute, private productService: ProductService, private router: Router, private authService: UserAuthService) { }

  ngOnInit(): void {
    this.route.data.subscribe((response: any) => {
      if (response && response.productDetails) {
        this.product = response.productDetails
      }
      else {
        this.productNotAvailable = true
        this.productService.clearCache()
      }
    }
    )
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.product.productImages.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.product.productImages.length) % this.product.productImages.length;
  }

  addToCart(cartId: any) {
    const roles = this.authService.getRoles()
    // console.log(roles);
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/forbidden'])
      return
    }

    // this.productService.addToCart(cartId, this.quantity).subscribe(
    //   (response) => {
    //     Swal.fire("Product added to your cart!")
    //   },
    //   (error) => {

    //     console.log(error);
    //     if (error.status == 500) {
    //       window.location.reload()
    //       this.productService.clearCache()
    //     }
    //   }
    // )

    // Check the stock status of the product before adding it to the cart
    if (this.product.stockStatus === "In Stock") {
      // If the product is in stock, proceed with adding it to the cart
      this.productService.addToCart(cartId, this.quantity).subscribe(
        (response) => {
          Swal.fire("Product added to your cart!");
        },
        (error) => {
          console.log(error);
          if (error.status === 500) {
            window.location.reload();
            this.productService.clearCache();
          }
        }
      );
    } else if (this.product.stockStatus === "Out of Stock" || this.product.stockStatus === "In Stock soon") {
      // If the product is out of stock or soon in stock, show a warning message
      Swal.fire({
        title: "Out of Stock",
        text: "This product is not in stock at the moment.",
        icon: "warning",
        confirmButtonText: "OK"
      });
    } else {
      // If the stock status is unknown or something else, show an error message
      Swal.fire({
        title: "Try again later",
        icon: "error",
        confirmButtonText: "OK"
      });
    }

  }

  buyNow(productId: any) {
    // console.log(this.product.id);

    if (this.product.stockStatus === "In Stock") {
      this.router.navigate(['/buyproduct'], {
        queryParams: {
          isSingleProductCheckout: true,
          id: productId
        }
      })
    }
    else if (this.product.stockStatus == "Out of Stock" || this.product.stockStatus == "In Stock soon") {
      Swal.fire({
        title: "Out of Stock",
        text: "This product is not in stock at the moment.",
        icon: "warning",
        confirmButtonText: "OK"
      });
    }
    else {
      Swal.fire({
        title: "Try again later",
        icon: "error",
        confirmButtonText: "OK"
      });

    }
  }
}

