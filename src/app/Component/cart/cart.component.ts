import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../../Service/product.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  isLoading: boolean = true;
  products: any = [];
  isNoProducts: boolean = false;
  ngOnInit(): void {
    this.getCartDetails();
  }

  getCartDetails() {
    this.productService.getCartDetails().subscribe(
      (response) => {
        this.isLoading = false;
        this.products = response;

        if (this.products.length === 0) {
          this.isNoProducts = true;
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching cart details:', error);
      }
    );
  }

  checkOut() {

    this.router.navigate(['/buyproduct'], {
      queryParams: {
        isSingleProductCheckout: false,
        id: 0
      }
    })
  }

  removeProduct(id: any) {
    this.productService.removeCartProduct(id).subscribe(
      response => {
        this.getCartDetails();
        Swal.fire("Product removed");

      },
      error => {
        console.log(error);
      }
    );
  }

}
