import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserAuthService } from '../../Service/user-auth.service';
import { AdminService } from '../../Service/admin.service';
import { ProductService } from '../../Service/product.service';
import { DashboardCountsResponse } from '../../Interface/dashboard';

export interface RecentActivityItem {
  id: string;
  type: 'order' | 'product' | 'user' | 'system';
  title: string;
  subtitle: string;
  timeAgo: string;
  badgeText: string;
  badgeType: 'success' | 'warning' | 'info' | 'forest';
  icon: string;
}

export interface ShortcutCard {
  title: string;
  description: string;
  link: string;
  icon: string;
  badge?: string;
  colorClass: string;
  bgClass: string;
}

@Component({
  selector: 'app-dashbordcomponet',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, DatePipe],
  templateUrl: './dashbordcomponet.component.html',
  styleUrl: './dashbordcomponet.component.css'
})
export class DashbordcomponetComponent implements OnInit {
  private userAuthService = inject(UserAuthService);
  private adminService = inject(AdminService);
  private productService = inject(ProductService);

  adminName: string = 'Admin';
  greeting: string = 'Welcome back';
  currentDate: Date = new Date();
  isLoading: boolean = false;

  // KPI Metrics (Populated from /api/admin/dashboard/counts)
  totalRevenue: number = 0;
  ordersProcessedCount: number = 0;
  totalOrdersCount: number = 0;
  placedOrdersCount: number = 0;
  deliveredOrdersCount: number = 0;
  totalProductsCount: number = 0;
  totalUsersCount: number = 0;

  // Recent Activity Feed
  recentActivities: RecentActivityItem[] = [
    {
      id: 'ACT-101',
      type: 'order',
      title: 'New Order Received',
      subtitle: 'Order #ORD-8492 for ₹18,499 from Karan Bhoi',
      timeAgo: '10 mins ago',
      badgeText: 'Delivered',
      badgeType: 'success',
      icon: 'bi-bag-check-fill'
    },
    {
      id: 'ACT-102',
      type: 'product',
      title: 'Catalogue Updated',
      subtitle: 'Stock adjusted for "Nordic Minimalist Oak Sofa"',
      timeAgo: '45 mins ago',
      badgeText: 'Inventory',
      badgeType: 'forest',
      icon: 'bi-box-seam-fill'
    },
    {
      id: 'ACT-103',
      type: 'user',
      title: 'Customer Account Verified',
      subtitle: 'admin@gmail.com verified admin credentials',
      timeAgo: '2 hours ago',
      badgeText: 'Security',
      badgeType: 'info',
      icon: 'bi-shield-check'
    },
    {
      id: 'ACT-104',
      type: 'order',
      title: 'Order Delivered',
      subtitle: 'Order #ORD-8490 marked as Delivered',
      timeAgo: '4 hours ago',
      badgeText: 'Delivered',
      badgeType: 'success',
      icon: 'bi-check2-circle'
    }
  ];

  // Quick Action Shortcuts
  shortcutCards: ShortcutCard[] = [
    {
      title: 'Product Inventory',
      description: 'Manage catalogue listings, pricing, and stock levels.',
      link: '/admin/product',
      icon: 'bi-box-seam',
      badge: 'Manage',
      colorClass: 'text-forest',
      bgClass: 'bg-forest-light'
    },
    {
      title: 'Order Fulfillment',
      description: 'Track placed customer orders and update delivery status.',
      link: '/admin/orders',
      icon: 'bi-bag-check',
      badge: 'Orders',
      colorClass: 'text-gold-dark',
      bgClass: 'bg-gold-light'
    },
    {
      title: 'Sales & Analytics',
      description: 'Review revenue trajectories and monthly performance.',
      link: '/admin/visualizationorders',
      icon: 'bi-bar-chart-line',
      badge: 'Analytics',
      colorClass: 'text-emerald',
      bgClass: 'bg-emerald-light'
    },
    {
      title: 'User Accounts',
      description: 'View registered customers and manage admin access.',
      link: '/admin/users',
      icon: 'bi-people',
      badge: 'Users',
      colorClass: 'text-blue',
      bgClass: 'bg-blue-light'
    }
  ];

  ngOnInit(): void {
    this.initGreeting();
    this.loadAdminData();
  }

  private initGreeting(): void {
    const name = this.userAuthService.getUserName();
    if (name) {
      this.adminName = name;
    }
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour < 18) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }

  loadAdminData(): void {
    this.isLoading = true;

    this.adminService.getDashboardCounts().subscribe({
      next: (counts: DashboardCountsResponse) => {
        this.isLoading = false;
        if (counts) {
          if (counts.grossRevenue) {
            this.totalRevenue = counts.grossRevenue.amount ?? 0;
            this.ordersProcessedCount = counts.grossRevenue.ordersProcessed ?? 0;
          }
          if (counts.totalOrders) {
            this.totalOrdersCount = counts.totalOrders.total ?? 0;
            this.placedOrdersCount = counts.totalOrders.pendingDispatch ?? 0;
            this.deliveredOrdersCount = counts.totalOrders.delivered ?? 0;
          }
          if (counts.activeCatalogue) {
            this.totalProductsCount = counts.activeCatalogue.liveItems ?? 0;
          }
          if (counts.registeredAccounts) {
            this.totalUsersCount = counts.registeredAccounts.total ?? 0;
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching admin dashboard counts:', err);
      }
    });
  }
}
