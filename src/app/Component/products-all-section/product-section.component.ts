import { Component, inject, input, effect, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../Service/product.service';
import { Product, ProductFilterParams, ProductPageResponse } from '../../Interface/product';
import { ProductCardComponent } from '../product-card/product-card.component';

export interface CategoryFilter {
  name: string;
  count?: number;
}

export interface SortOption {
  value: string;
  label: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
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
  pageSize: number = 12;
  totalPages: number = 1;
  totalElements: number = 0;
  showLoadButton: boolean = false;
  isLoading: boolean = false;
  products: Product[] = [];
  readonly filterText = input<string>('');
  selectedCategories: string[] = [];

  // Filters State
  inStockOnly: boolean = false;
  minPrice: number = 0;
  maxPrice: number = 100000;
  sortBy: string = 'recommended';
  isSortDropdownOpen: boolean = false;
  wishlistSet: Set<number> = new Set();
  isMobileFilterOpen: boolean = false;

  sortOptions: SortOption[] = [
    { value: 'recommended', label: 'Recommended', sortBy: 'createdDate', sortDir: 'desc' },
    { value: 'priceLowHigh', label: 'Price: Low to High', sortBy: 'price', sortDir: 'asc' },
    { value: 'priceHighLow', label: 'Price: High to Low', sortBy: 'price', sortDir: 'desc' },
    { value: 'nameAsc', label: 'Name: A to Z', sortBy: 'name', sortDir: 'asc' }
  ];

  categoryList: CategoryFilter[] = [
    { name: 'All Furniture' },
    { name: 'Living Room' },
    { name: 'Bedroom' },
    { name: 'Dining Room' },
    { name: 'Office Furniture' },
    { name: 'Outdoor Furniture' },
    { name: 'Storage Solutions' }
  ];

  constructor() {
    effect(() => {
      // Whenever search text changes, reload from page 0
      const _ = this.filterText();
      this.resetAndFetch();
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
    this.resetAndFetch();
  }

  getSortLabel(): string {
    const opt = this.sortOptions.find(o => o.value === this.sortBy);
    return opt ? opt.label : 'Recommended';
  }

  isCategorySelected(categoryName: string): boolean {
    if (categoryName === 'All' || categoryName === 'All Furniture') {
      return this.selectedCategories.length === 0;
    }
    return this.selectedCategories.includes(categoryName);
  }

  toggleCategory(categoryName: string) {
    if (categoryName === 'All' || categoryName === 'All Furniture') {
      this.selectedCategories = [];
    } else {
      if (this.selectedCategories.includes(categoryName)) {
        this.selectedCategories = this.selectedCategories.filter(c => c !== categoryName);
      } else {
        this.selectedCategories = [...this.selectedCategories, categoryName];
      }
    }
    this.resetAndFetch();
  }

  toggleInStock() {
    this.inStockOnly = !this.inStockOnly;
    this.resetAndFetch();
  }

  onPriceChange() {
    this.resetAndFetch();
  }

  clearAllFilters() {
    this.selectedCategories = [];
    this.inStockOnly = false;
    this.minPrice = 0;
    this.maxPrice = 100000;
    this.sortBy = 'recommended';
    this.resetAndFetch();
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedCategories.length > 0 ||
      this.inStockOnly ||
      this.minPrice > 0 ||
      this.maxPrice < 100000
    );
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

  resetAndFetch() {
    this.pageNumber = 0;
    this.products = [];
    this.getAllProducts();
  }

  getAllProducts() {
    const activeSort = this.sortOptions.find(o => o.value === this.sortBy) || this.sortOptions[0];
    const categoryParam =
      this.selectedCategories.length > 0
        ? (this.selectedCategories.length === 1 ? this.selectedCategories[0] : this.selectedCategories.join(','))
        : '';

    const filterParams: ProductFilterParams = {
      pageNumber: this.pageNumber,
      pageSize: 5,
      searchKey: this.filterText() || '',
      searchCategory: categoryParam,
      minPrice: this.minPrice > 0 ? this.minPrice : undefined,
      maxPrice: this.maxPrice < 100000 ? this.maxPrice : undefined,
      stockStatus: this.inStockOnly ? 'in_stock' : undefined,
      sortBy: activeSort.sortBy,
      sortDir: activeSort.sortDir
    };

    this.isLoading = true;

    this.productService.getAllProducts(filterParams).subscribe({
      next: (response: ProductPageResponse) => {
        this.isLoading = false;
        let incomingProducts: Product[] = [];

        if (response) {
          if (Array.isArray(response)) {
            incomingProducts = response;
            this.totalElements = response.length;
            this.totalPages = 1;
          } else {
            incomingProducts = response.products || [];
            this.totalElements = response.totalElements ?? incomingProducts.length;
            this.totalPages = response.totalPages ?? 1;
          }
        }

        this.products = incomingProducts;
        this.noFilteredItems = this.products.length === 0;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching products', error);
        this.products = [];
        this.noFilteredItems = true;
      }
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages || 1;
    const current = this.pageNumber;
    let start = Math.max(0, current - 2);
    let end = Math.min(total - 1, current + 2);

    if (end - start < 4) {
      if (start === 0) {
        end = Math.min(total - 1, start + 4);
      } else if (end === total - 1) {
        start = Math.max(0, end - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page < 0 || (this.totalPages && page >= this.totalPages) || page === this.pageNumber) {
      return;
    }
    this.pageNumber = page;
    this.getAllProducts();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  productDetailPage(id: any) {
    this.router.navigate(['/product'], {
      queryParams: {
        productId: id
      }
    });
  }
}
