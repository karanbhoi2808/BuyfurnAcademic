import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../Service/product.service';
import { LoadingComponent } from '../loading/loading.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-product-section',
  standalone: true,
  imports: [RouterLink, LoadingComponent, NgFor, NgIf],
  templateUrl: './product-section.component.html',
  styleUrl: './product-section.component.css'
})
export class ProductSectionComponent implements OnChanges {
  noFilteredItems: boolean = false
  pageNumber: number = 0;
  showLoadButton: boolean = false;
  products: any[] = [];
  @Input() filterText: string = '';
  selectedCategory: string = '';

  constructor(private productService: ProductService, private router: Router) { }


  categories: string[] = ['All', 'Living Room', 'Bedroom', 'Dining Room', 'Office Furniture', 'Outdoor Furniture', 'Storage Solutions'];

  ngOnChanges(changes: SimpleChanges) {

    if (changes['filterText']) {
      this.pageNumber = 0;
      this.products = [];
      this.getAllProducts();
    }
  }
  filterProductByCategory(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value;

    this.pageNumber = 0;
    this.products = [];
    this.productService.clearCache()
    this.getAllProducts()
  }

  getAllProducts() {
    if (this.selectedCategory === "All") {
      this.selectedCategory = "";

    }
    this.productService.getAllProducts(this.pageNumber, this.filterText, this.selectedCategory).subscribe(
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
    this.productService.clearCache()
    this.pageNumber++;
    this.getAllProducts();

  }

  productDetailPage(id: any) {
    this.router.navigate(['/product'], {
      queryParams: {
        productId: id
      }
    })
  }
}
