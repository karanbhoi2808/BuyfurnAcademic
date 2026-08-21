import { Component, inject, input, effect, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../Service/product.service';

import { ProductCardComponent } from '../product-card/product-card.component';

export interface CategoryFilter {
  name: string;
  count: number;
}

export interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-product-section',
  imports: [CommonModule, FormsModule, ProductCardComponent],
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
  selectedCategory: string = 'All';

  // Filters State
  inStockOnly: boolean = false;
  minPrice: number = 0;
  maxPrice: number = 100000;
  sortBy: string = 'recommended';
  isSortDropdownOpen: boolean = false;
  wishlistSet: Set<number> = new Set();
  isMobileFilterOpen: boolean = false;

  sortOptions: SortOption[] = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'priceLowHigh', label: 'Price: Low to High' },
    { value: 'priceHighLow', label: 'Price: High to Low' },
    { value: 'nameAsc', label: 'Name: A to Z' }
  ];

  categoryList: CategoryFilter[] = [
    { name: 'All Furniture', count: 124 },
    { name: 'Living Room', count: 45 },
    { name: 'Dining', count: 32 },
    { name: 'Bedroom', count: 28 },
    { name: 'Home Office', count: 19 }
  ];

  constructor() {
    effect(() => {
      const text = this.filterText();
      this.pageNumber = 0;
      this.products = [];
      this.getAllProducts();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown-container')) {
      this.isSortDropdownOpen = false;
    }
  }

  toggleSortDropdown(event: Event) {
    event.stopPropagation();
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  selectSortOption(value: string) {
    this.sortBy = value;
    this.isSortDropdownOpen = false;
  }

  getSortLabel(): string {
    const opt = this.sortOptions.find(o => o.value === this.sortBy);
    return opt ? opt.label : 'Recommended';
  }

  selectCategory(categoryName: string) {
    this.selectedCategory = categoryName;
    this.pageNumber = 0;
    this.products = [];
    this.getAllProducts();
  }

  toggleInStock() {
    this.inStockOnly = !this.inStockOnly;
  }

  clearAllFilters() {
    this.selectedCategory = 'All';
    this.inStockOnly = false;
    this.minPrice = 0;
    this.maxPrice = 100000;
    this.sortBy = 'recommended';
    this.pageNumber = 0;
    this.products = [];
    this.getAllProducts();
  }

  hasActiveFilters(): boolean {
    return this.selectedCategory !== 'All' || this.inStockOnly || this.minPrice > 0 || this.maxPrice < 100000;
  }

  toggleWishlist(productId: number, event: Event) {
    event.stopPropagation();
    if (this.wishlistSet.has(productId)) {
      this.wishlistSet.delete(productId);
    } else {
      this.wishlistSet.add(productId);
    }
  }

  isWishlisted(productId: number): boolean {
    return this.wishlistSet.has(productId);
  }

  toggleMobileFilter() {
    this.isMobileFilterOpen = !this.isMobileFilterOpen;
  }

  getAllProducts() {
    const apiCategory = (this.selectedCategory === 'All' || this.selectedCategory === 'All Furniture') ? '' : this.selectedCategory;

    this.productService.getAllProducts(this.pageNumber, this.filterText(), apiCategory).subscribe(
      (response) => {
        if (response && response.length > 0) {
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

  getProcessedProducts(): any[] {
    let result = [...this.products];

    // Filter by Stock Status
    if (this.inStockOnly) {
      result = result.filter(p => p.stockStatus === 'In Stock' || p.stockStatus === 'IN_STOCK' || !p.stockStatus);
    }

    // Filter by Price Range
    result = result.filter(p => p.price >= this.minPrice && p.price <= this.maxPrice);

    // Apply Sorting
    if (this.sortBy === 'priceLowHigh') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'priceHighLow') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'nameAsc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }

  loadMoreProducts() {
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
