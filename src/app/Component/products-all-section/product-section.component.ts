import { Component, inject, input, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../Service/product.service';

@Component({
  selector: 'app-product-section',
  imports: [],
  templateUrl: './product-section.component.html',
  styleUrl: './product-section.component.css'
})
export class ProductSectionComponent {
  private productService = inject(ProductService);
  private router = inject(Router);

  noFilteredItems: boolean = false;
  pageNumber: number = 0;
  showLoadButton: boolean = false;
  products: any[] = [];
  readonly filterText = input<string>('');
  selectedCategory: string = '';

  categories: string[] = ['All', 'Living Room', 'Bedroom', 'Dining Room', 'Office Furniture', 'Outdoor Furniture', 'Storage Solutions'];

  constructor() {
    effect(() => {
      // Track filterText signal
      const text = this.filterText();
      this.pageNumber = 0;
      this.products = [];
      this.getAllProducts();
    });
  }

  filterProductByCategory(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value;

    this.pageNumber = 0;
    this.products = [];
    this.productService.clearCache();
    this.getAllProducts();
  }

  getAllProducts() {
    if (this.selectedCategory === "All") {
      this.selectedCategory = "";
    }
    this.productService.getAllProducts(this.pageNumber, this.filterText(), this.selectedCategory).subscribe(
      (response) => {
        if (response.length > 0) {
          this.products = [...this.products, ...response];
          this.showLoadButton = response.length === 12;
          this.noFilteredItems = false;
        } else {
          this.showLoadButton = false;
          this.noFilteredItems = this.pageNumber === 0;
        }
      },
      (error) => {
        console.error('Error fetching products', error);
      }
    );
  }

  loadMoreProducts() {
    this.productService.clearCache();
    this.pageNumber++;
    this.getAllProducts();
  }

  productDetailPage(id: any) {
    this.router.navigate(['/product'], {
      queryParams: {
        productId: id
      }
    });
  }
}
