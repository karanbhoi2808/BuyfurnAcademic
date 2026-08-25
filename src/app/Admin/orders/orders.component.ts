import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductService } from '../../Service/product.service';
import { AdminService } from '../../Service/admin.service';
import {
  OrderItem,
  OrderFilterParams,
  OrderPageResponse
} from '../../Interface/orderdetails';
import { CommonGridComponent, GridColumn } from '../../Component/common-grid/common-grid.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule, RouterLink, CommonGridComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private adminService = inject(AdminService);

  // Orders list
  orders: OrderItem[] = [];

  // Grid Columns Configuration
  columns: GridColumn<OrderItem>[] = [
    { key: 'orderId', header: 'Order ID & Date', sortable: true, sortKey: 'createdAt', width: '190px' },
    { key: 'customer', header: 'Customer', width: '200px' },
    { key: 'product', header: 'Product Item', width: '240px' },
    { key: 'address', header: 'Shipping Address', width: '230px' },
    { key: 'amount', header: 'Amount', sortable: true, sortKey: 'product.price', width: '130px' },
    { key: 'status', header: 'Fulfillment Status', sortable: true, sortKey: 'orderStatus', width: '160px' },
    { key: 'actions', header: 'Actions', align: 'right', headerClass: 'pe-4', cellClass: 'pe-4', width: '180px' }
  ];

  // State
  isLoading: boolean = false;
  isSortDropdownOpen: boolean = false;
  selectedStatusTab: 'all' | 'Placed' | 'Delivered' = 'all';
  searchQuery: string = '';
  sortBy: 'latest' | 'oldest' | 'price_desc' | 'price_asc' = 'latest';
  currentSortBy: string = 'createdAt';
  currentSortDir: 'asc' | 'desc' = 'desc';

  sortOptions = [
    { label: 'Newest First', value: 'latest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Price', value: 'price_desc' },
    { label: 'Lowest Price', value: 'price_asc' }
  ];

  // Pagination State
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // Stats from backend API
  totalOrderCount: number = 0;
  placedOrderCount: number = 0;
  deliveredOrderCount: number = 0;
  totalRevenue: number = 0;

  // Detail Modal State
  selectedOrder: OrderItem | null = null;
  isDeliveringId: number | null = null;

  // Search Debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.getOrderDetails();
    });

    this.getOrderDetails('all', 0);
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  getOrderDetails(
    statusTab: 'all' | 'Placed' | 'Delivered' = this.selectedStatusTab,
    pageNumber: number = this.currentPage
  ): void {
    this.selectedStatusTab = statusTab;
    this.currentPage = pageNumber;
    this.isLoading = true;

    let sortByField = 'createdAt';
    let sortDir = 'desc';

    if (this.sortBy === 'latest') {
      sortByField = 'createdAt';
      sortDir = 'desc';
    } else if (this.sortBy === 'oldest') {
      sortByField = 'createdAt';
      sortDir = 'asc';
    } else if (this.sortBy === 'price_desc') {
      sortByField = 'product.price';
      sortDir = 'desc';
    } else if (this.sortBy === 'price_asc') {
      sortByField = 'product.price';
      sortDir = 'asc';
    }

    const params: OrderFilterParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      status: this.selectedStatusTab,
      searchKey: this.searchQuery.trim(),
      sortBy: sortByField,
      sortDir: sortDir
    };

    this.adminService.getAllOrders(params).subscribe({
      next: (response: OrderPageResponse | any) => {
        this.isLoading = false;
        if (response && response.orders) {
          this.orders = response.orders || [];
          this.totalOrderCount = response.totalOrders ?? 0;
          this.placedOrderCount = response.placedCount ?? 0;
          this.deliveredOrderCount = response.deliveredCount ?? 0;
          this.totalRevenue = response.totalRevenue ?? 0;
          this.totalPages = response.totalPages ?? 0;
          this.currentPage = response.currentPage ?? 0;
        } else if (Array.isArray(response)) {
          this.orders = response;
          this.totalOrderCount = response.length;
          this.placedOrderCount = response.filter((o: any) => o.orderStatus?.toLowerCase() === 'placed').length;
          this.deliveredOrderCount = response.filter((o: any) => o.orderStatus?.toLowerCase() === 'delivered').length;
          this.totalRevenue = response.reduce((sum: number, o: any) => sum + Number(o.product?.price || 0), 0);
          this.totalPages = Math.ceil(response.length / this.pageSize) || 1;
        } else {
          this.orders = [];
          this.totalPages = 0;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching admin orders:', error);
        this.orders = [];
        this.totalPages = 0;
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 0;
    this.getOrderDetails();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.isSortDropdownOpen = false;
  }

  toggleSortDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  selectSortOption(sortVal: any): void {
    this.sortBy = sortVal;
    this.isSortDropdownOpen = false;
    this.onSortChange(sortVal);
  }

  getSortLabel(): string {
    const opt = this.sortOptions.find((o) => o.value === this.sortBy);
    return opt ? opt.label : 'Newest First';
  }

  onStatusTabChange(status: 'all' | 'Placed' | 'Delivered'): void {
    this.selectedStatusTab = status;
    this.currentPage = 0;
    this.getOrderDetails(status, 0);
  }

  onSortChange(sort: any): void {
    this.sortBy = sort;
    if (sort === 'latest') {
      this.currentSortBy = 'createdAt';
      this.currentSortDir = 'desc';
    } else if (sort === 'oldest') {
      this.currentSortBy = 'createdAt';
      this.currentSortDir = 'asc';
    } else if (sort === 'price_desc') {
      this.currentSortBy = 'product.price';
      this.currentSortDir = 'desc';
    } else if (sort === 'price_asc') {
      this.currentSortBy = 'product.price';
      this.currentSortDir = 'asc';
    }
    this.currentPage = 0;
    this.getOrderDetails();
  }

  onGridSort(event: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.currentSortBy = event.sortBy;
    this.currentSortDir = event.sortDir;

    if (event.sortBy === 'createdAt') {
      this.sortBy = event.sortDir === 'desc' ? 'latest' : 'oldest';
    } else if (event.sortBy === 'product.price') {
      this.sortBy = event.sortDir === 'desc' ? 'price_desc' : 'price_asc';
    }
    this.currentPage = 0;
    this.getOrderDetails();
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.currentPage = 0;
    this.getOrderDetails();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getOrderDetails(this.selectedStatusTab, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPaginationPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      if (current > 2) {
        pages.push('...');
      }
      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (current < total - 3) {
        pages.push('...');
      }
      pages.push(total - 1);
    }
    return pages;
  }

  isOrderDelivered(order: OrderItem): boolean {
    return order?.orderStatus?.toLowerCase() === 'delivered';
  }

  markAsDelivered(order: OrderItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    Swal.fire({
      title: `Mark Order #${order.orderId} as Delivered?`,
      text: `Customer ${order.user?.email || ''} will be notified of completion.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e3a2b',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Mark Delivered',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDeliveringId = order.orderId;
        this.productService.markOrderAsDelivered(order.orderId).subscribe({
          next: () => {
            this.isDeliveringId = null;
            Swal.fire({
              icon: 'success',
              title: 'Order Delivered!',
              text: `Order #${order.orderId} status has been updated to Delivered.`,
              timer: 2000,
              showConfirmButton: false
            });
            // Reload current view
            this.getOrderDetails();
            if (this.selectedOrder && this.selectedOrder.orderId === order.orderId) {
              this.selectedOrder.orderStatus = 'Delivered';
            }
          },
          error: (err) => {
            this.isDeliveringId = null;
            console.error('Error marking order delivered:', err);
            Swal.fire('Error', 'Failed to update order status. Please try again.', 'error');
          }
        });
      }
    });
  }

  openOrderDetails(order: OrderItem): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
}


