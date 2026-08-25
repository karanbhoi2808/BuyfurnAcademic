import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AdminService } from '../../Service/admin.service';
import { ProductService } from '../../Service/product.service';
import { Product, ProductFilterParams, ProductPageResponse } from '../../Interface/product';
import { CommonGridComponent, GridColumn } from '../../Component/common-grid/common-grid.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommonGridComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private productService = inject(ProductService);
  private router = inject(Router);

  // Data State
  products: Product[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // Grid Columns Configuration
  columns: GridColumn<Product>[] = [
    { key: 'productInfo', header: 'Product Info' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', sortable: true, sortKey: 'price' },
    { key: 'stockStatus', header: 'Stock Status' },
    { key: 'actions', header: 'Actions', align: 'right', headerClass: 'pe-4', cellClass: 'pe-4' }
  ];

  // Loading & Filter States
  isLoading: boolean = false;
  isFilterPanelOpen: boolean = false;
  isSortDropdownOpen: boolean = false;
  isStockDropdownOpen: boolean = false;

  // Filter States
  searchKey: string = '';
  selectedCategories: string[] = [];
  selectedStockStatus: string = 'ALL';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: string = 'createdAt';
  sortDir: 'asc' | 'desc' = 'desc';
  currentSortKey: string = 'latest';

  // Modal / Detail state
  selectedProduct: Product | null = null;
  activeImageIndex: number = 0;

  // Available Categories & Stock Options
  categories: string[] = [
    'Living Room',
    'Bedroom',
    'Dining Room',
    'Office Furniture',
    'Outdoor Furniture',
    'Storage Solutions'
  ];

  stockFilterOptions = [
    { label: 'All Stock Status', value: 'ALL' },
    { label: 'In Stock', value: 'in_stock' },
    { label: 'In Stock Soon', value: 'in_stock_soon' },
    { label: 'Out of Stock', value: 'out_of_stock' }
  ];

  sortOptions = [
    { label: 'Newest Arrivals', value: 'latest', sortBy: 'createdAt', sortDir: 'desc' },
    { label: 'Price: Low to High', value: 'price_asc', sortBy: 'price', sortDir: 'asc' },
    { label: 'Price: High to Low', value: 'price_desc', sortBy: 'price', sortDir: 'desc' },
    { label: 'Product Name: A to Z', value: 'name_asc', sortBy: 'name', sortDir: 'asc' },
    { label: 'Product Name: Z to A', value: 'name_desc', sortBy: 'name', sortDir: 'desc' }
  ];

  // Search Debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((term) => {
        this.searchKey = term;
        this.currentPage = 0;
        this.getAllProducts();
      });

    this.getAllProducts();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  getAllProducts(): void {
    this.isLoading = true;

    const filterParams: ProductFilterParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchKey: this.searchKey,
      searchCategory: this.selectedCategories.length > 0 ? this.selectedCategories.join(',') : '',
      minPrice: this.minPrice !== null && this.minPrice !== undefined ? Number(this.minPrice) : undefined,
      maxPrice: this.maxPrice !== null && this.maxPrice !== undefined ? Number(this.maxPrice) : undefined,
      stockStatus: this.selectedStockStatus !== 'ALL' ? this.selectedStockStatus : undefined,
      sortBy: this.sortBy,
      sortDir: this.sortDir
    };

    this.adminService.getAllProducts(filterParams).subscribe({
      next: (response: ProductPageResponse | any) => {
        this.isLoading = false;
        if (response && response.products) {
          this.products = response.products;
          this.currentPage = response.currentPage ?? 0;
          this.totalPages = response.totalPages ?? 0;
          this.totalElements = response.totalElements ?? 0;
          this.pageSize = response.pageSize ?? this.pageSize;
        } else if (Array.isArray(response)) {
          this.products = response;
          this.totalElements = response.length;
          this.totalPages = Math.ceil(response.length / this.pageSize) || 1;
        } else {
          this.products = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching admin products:', error);
        this.products = [];
      }
    });
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchKey = '';
    this.currentPage = 0;
    this.getAllProducts();
  }

  toggleCategory(category: string): void {
    if (!category) {
      this.selectedCategories = [];
    } else {
      const index = this.selectedCategories.indexOf(category);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      } else {
        this.selectedCategories.push(category);
      }
    }
    this.currentPage = 0;
    this.getAllProducts();
  }

  isCategorySelected(category: string): boolean {
    if (!category) {
      return this.selectedCategories.length === 0;
    }
    return this.selectedCategories.includes(category);
  }

  removeCategory(category: string): void {
    this.selectedCategories = this.selectedCategories.filter((c) => c !== category);
    this.currentPage = 0;
    this.getAllProducts();
  }

  onStockStatusChange(status: string): void {
    this.selectedStockStatus = status;
    this.currentPage = 0;
    this.getAllProducts();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.isSortDropdownOpen = false;
    this.isStockDropdownOpen = false;
  }

  toggleSortDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
    this.isStockDropdownOpen = false;
  }

  selectSortOption(sortKey: string): void {
    this.onSortChange(sortKey);
    this.isSortDropdownOpen = false;
  }

  getCurrentSortLabel(): string {
    const opt = this.sortOptions.find((o) => o.value === this.currentSortKey);
    return opt ? opt.label : 'Newest Arrivals';
  }

  toggleStockDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isStockDropdownOpen = !this.isStockDropdownOpen;
    this.isSortDropdownOpen = false;
  }

  selectStockOption(status: string): void {
    this.onStockStatusChange(status);
    this.isStockDropdownOpen = false;
  }

  getSelectedStockLabel(): string {
    const opt = this.stockFilterOptions.find((o) => o.value === this.selectedStockStatus);
    return opt ? opt.label : 'All Stock Status';
  }

  onSortChange(sortKey: string): void {
    this.currentSortKey = sortKey;
    const selected = this.sortOptions.find((opt) => opt.value === sortKey);
    if (selected) {
      this.sortBy = selected.sortBy;
      this.sortDir = selected.sortDir as 'asc' | 'desc';
    }
    this.currentPage = 0;
    this.getAllProducts();
  }

  onGridSort(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy = event.sortBy;
    this.sortDir = event.sortDir;
    this.currentPage = 0;
    this.getAllProducts();
  }

  applyPriceFilter(): void {
    if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Range',
        text: 'Minimum price cannot be greater than Maximum price.'
      });
      return;
    }
    this.currentPage = 0;
    this.getAllProducts();
  }

  resetPriceFilter(): void {
    this.minPrice = null;
    this.maxPrice = null;
    this.currentPage = 0;
    this.getAllProducts();
  }

  clearAllFilters(): void {
    this.searchKey = '';
    this.selectedCategories = [];
    this.selectedStockStatus = 'ALL';
    this.minPrice = null;
    this.maxPrice = null;
    this.currentSortKey = 'latest';
    this.sortBy = 'createdAt';
    this.sortDir = 'desc';
    this.currentPage = 0;
    this.getAllProducts();
  }

  hasActiveFilters(): boolean {
    return (
      !!this.searchKey ||
      this.selectedCategories.length > 0 ||
      this.selectedStockStatus !== 'ALL' ||
      this.minPrice !== null ||
      this.maxPrice !== null ||
      this.currentSortKey !== 'latest'
    );
  }

  activeFilterCount(): number {
    let count = 0;
    if (this.searchKey) count++;
    if (this.selectedCategories.length > 0) count += this.selectedCategories.length;
    if (this.selectedStockStatus !== 'ALL') count++;
    if (this.minPrice !== null || this.maxPrice !== null) count++;
    if (this.currentSortKey !== 'latest') count++;
    return count;
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getAllProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.getAllProducts();
  }

  openQuickView(product: Product): void {
    this.selectedProduct = product;
    this.activeImageIndex = 0;
  }

  closeQuickView(): void {
    this.selectedProduct = null;
  }

  deleteProduct(product: Product): void {
    Swal.fire({
      title: 'Delete Product?',
      html: `Are you sure you want to delete <strong class="text-danger">${product.title}</strong>?<br><small class="text-muted">This product will be permanently removed.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: '<i class="bi bi-trash3 me-1"></i> Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-4 shadow-lg'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProductById(product.id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted Successfully!',
              text: `${product.title} has been removed.`,
              icon: 'success',
              timer: 1800,
              showConfirmButton: false
            });
            this.getAllProducts();
          },
          error: (err) => {
            console.error('Delete error:', err);
            Swal.fire('Delete Failed', 'Unable to delete product. Please try again.', 'error');
          }
        });
      }
    });
  }

  getStockBadgeClass(status?: string): string {
    if (!status) return 'badge-stock-unknown';
    const s = status.toLowerCase().replace(/[\s_-]+/g, '');
    if (s.includes('instocksoon') || s.includes('soon')) {
      return 'badge-stock-soon';
    }
    if (s.includes('out') || s.includes('outofstock')) {
      return 'badge-stock-out';
    }
    if (s.includes('in') || s.includes('instock')) {
      return 'badge-stock-in';
    }
    return 'badge-stock-unknown';
  }

  formatStockLabel(status?: string): string {
    if (!status) return 'Status Unknown';
    const s = status.toLowerCase().replace(/[\s_-]+/g, '');
    if (s.includes('instocksoon') || s.includes('soon')) {
      return 'In Stock Soon';
    }
    if (s.includes('out') || s.includes('outofstock')) {
      return 'Out of Stock';
    }
    if (s.includes('in') || s.includes('instock')) {
      return 'In Stock';
    }
    return status;
  }

  productDetailPage(id: any): void {
    this.router.navigate(['/admin/productdetails'], {
      queryParams: { productId: id }
    });
  }
}
