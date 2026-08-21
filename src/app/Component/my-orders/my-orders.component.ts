import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../Service/product.service';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {
  private productService = inject(ProductService);

  isLoading: boolean = true;
  orderDetails: any[] = [];

  ngOnInit(): void {
    this.myOrders();
  }

  myOrders(): void {
    this.isLoading = true;
    this.productService.myOrders().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.orderDetails = response || [];
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver') || s.includes('complete')) {
      return 'badge-status-delivered';
    }
    if (s.includes('dispatch') || s.includes('transit') || s.includes('ship')) {
      return 'badge-status-dispatched';
    }
    return 'badge-status-processing';
  }
}
