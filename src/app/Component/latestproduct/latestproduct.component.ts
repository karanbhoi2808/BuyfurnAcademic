import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../../Service/product.service';
import { error, log } from 'console';
import { Product } from '../../Interface/product';

import { Router } from '@angular/router';

@Component({
  selector: 'app-latestproduct',
  imports: [],
  templateUrl: './latestproduct.component.html',
  styleUrl: './latestproduct.component.css'
})
export class LatestproductComponent implements OnInit {
  isLoading: boolean = false;
  products: Product[] = [];
  isEmpty: boolean = false;

  private productService = inject(ProductService);
  private router = inject(Router);

  ngOnInit(): void {
    this.getLatestProduct()
  }

  getLatestProduct() {
    this.isLoading = true;
    this.productService.getLetestProducts().subscribe(data => {
      this.isLoading = false;

      this.products = data;
      if (this.products.length === 0) {
        this.isEmpty = true
      }
      else {
        this.isEmpty = false
      }
    }, error => {
      console.log(error);
      this.isLoading = false;
    }
    )
  }

  productDetailPage(id: any) {
    this.router.navigate(['/product'], {
      queryParams: {
        productId: id
      }
    })
  }
}
