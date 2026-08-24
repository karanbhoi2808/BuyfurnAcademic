import {
  Component,
  OnInit,
  ElementRef,
  inject,
  viewChild,
  OnDestroy
} from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, ChartOptions, ChartType, registerables } from 'chart.js';
import { AdminService } from '../../Service/admin.service';
import {
  OrderAnalyticsResponse,
  MonthlyStats,
  CategoryStats
} from '../../Interface/orderdetails';

@Component({
  selector: 'app-order-visualization',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './order-visualization.component.html',
  styleUrls: ['./order-visualization.component.css']
})
export class OrderVisualizationComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);

  private readonly revenueChartRef = viewChild<ElementRef>('revenueChart');
  private readonly categoryChartRef = viewChild<ElementRef>('categoryChart');
  private readonly statusChartRef = viewChild<ElementRef>('statusChart');

  monthlyBreakdown: MonthlyStats[] = [];
  categoryBreakdown: CategoryStats[] = [];

  isLoading: boolean = false;
  isOrderIsEmpty: boolean = false;

  // Filter state
  selectedStatusFilter: 'all' | 'Delivered' | 'Placed' = 'all';
  chartType: 'line' | 'bar' = 'line';

  // KPI Metrics
  totalRevenue: number = 0;
  totalOrders: number = 0;
  averageOrderValue: number = 0;
  peakMonthName: string = 'N/A';
  peakMonthRevenue: number = 0;
  deliveredCount: number = 0;
  placedCount: number = 0;

  // Chart instances
  private revenueChartInstance?: Chart<any, any, any>;
  private categoryChartInstance?: Chart<any, any, any>;
  private statusChartInstance?: Chart<any, any, any>;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.fetchOrders(this.selectedStatusFilter);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  fetchOrders(status: 'all' | 'Delivered' | 'Placed'): void {
    this.selectedStatusFilter = status;
    this.isLoading = true;

    this.adminService.getOrderAnalytics(status).subscribe({
      next: (response: OrderAnalyticsResponse) => {
        this.isLoading = false;

        if (!response || !response.summary || response.summary.totalOrders === 0) {
          this.isOrderIsEmpty = true;
          this.resetMetrics();
          this.destroyCharts();
        } else {
          this.isOrderIsEmpty = false;
          this.applyAnalyticsData(response);
          // Timeout to ensure DOM canvases are rendered
          setTimeout(() => {
            this.renderAllCharts();
          }, 50);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching order analytics:', error);
        this.resetMetrics();
        this.isOrderIsEmpty = true;
        this.destroyCharts();
      }
    });
  }

  toggleChartType(type: 'line' | 'bar'): void {
    this.chartType = type;
    this.renderRevenueChart();
  }

  private applyAnalyticsData(data: OrderAnalyticsResponse): void {
    const summary = data.summary;
    this.totalRevenue = summary?.totalRevenue ?? 0;
    this.totalOrders = summary?.totalOrders ?? 0;
    this.averageOrderValue = summary?.averageOrderValue ?? 0;
    this.deliveredCount = summary?.deliveredCount ?? data.statusBreakdown?.delivered ?? 0;
    this.placedCount = summary?.placedCount ?? data.statusBreakdown?.placed ?? 0;
    this.peakMonthName = summary?.peakMonth?.month || 'N/A';
    this.peakMonthRevenue = summary?.peakMonth?.revenue ?? 0;

    this.monthlyBreakdown = Array.isArray(data.monthlyBreakdown) ? data.monthlyBreakdown : [];
    this.categoryBreakdown = Array.isArray(data.categoryBreakdown) ? data.categoryBreakdown : [];
  }

  private resetMetrics(): void {
    this.totalRevenue = 0;
    this.totalOrders = 0;
    this.averageOrderValue = 0;
    this.peakMonthName = 'N/A';
    this.peakMonthRevenue = 0;
    this.deliveredCount = 0;
    this.placedCount = 0;
    this.monthlyBreakdown = [];
    this.categoryBreakdown = [];
  }

  renderAllCharts(): void {
    this.renderRevenueChart();
    this.renderCategoryChart();
    this.renderStatusChart();
  }

  private renderRevenueChart(): void {
    const canvas = this.revenueChartRef()?.nativeElement as HTMLCanvasElement;
    if (!canvas) return;

    if (this.revenueChartInstance) {
      this.revenueChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = this.monthlyBreakdown.map((d) => d.month);
    const dataValues = this.monthlyBreakdown.map((d) => d.totalPrice);

    // Gradient background for Line Chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(30, 58, 43, 0.45)');
    gradient.addColorStop(0.7, 'rgba(30, 58, 43, 0.05)');
    gradient.addColorStop(1, 'rgba(30, 58, 43, 0.0)');

    this.revenueChartInstance = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly Revenue (₹)',
            data: dataValues,
            borderColor: '#1e3a2b',
            backgroundColor: this.chartType === 'line' ? gradient : 'rgba(30, 58, 43, 0.85)',
            borderWidth: 3,
            fill: this.chartType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#ffcc00',
            pointBorderColor: '#1e3a2b',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            borderRadius: this.chartType === 'bar' ? 6 : 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context: any) => ` Revenue: ₹${Number(context.parsed.y).toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { weight: 'bold' },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.7)'
            },
            ticks: {
              color: '#64748b',
              callback: (value) => `₹${Number(value).toLocaleString('en-IN')}`
            }
          }
        }
      } as ChartOptions
    });
  }

  private renderCategoryChart(): void {
    const canvas = this.categoryChartRef()?.nativeElement as HTMLCanvasElement;
    if (!canvas) return;

    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = this.categoryBreakdown.map((c) => c.category);
    const data = this.categoryBreakdown.map((c) => c.revenue);
    const palette = [
      '#1e3a2b',
      '#d97706',
      '#2563eb',
      '#10b981',
      '#8b5cf6',
      '#ec4899',
      '#64748b'
    ];

    this.categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: palette.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { size: 12, weight: 'bold' }
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => ` ₹${Number(context.parsed).toLocaleString('en-IN')}`
            }
          }
        },
        cutout: '68%'
      } as any
    });
  }

  private renderStatusChart(): void {
    const canvas = this.statusChartRef()?.nativeElement as HTMLCanvasElement;
    if (!canvas) return;

    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.statusChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Delivered', 'Placed'],
        datasets: [
          {
            data: [this.deliveredCount, this.placedCount],
            backgroundColor: ['#10b981', '#f59e0b'],
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { size: 12, weight: 'bold' }
            }
          }
        }
      }
    });
  }

  private destroyCharts(): void {
    if (this.revenueChartInstance) {
      this.revenueChartInstance.destroy();
      this.revenueChartInstance = undefined;
    }
    if (this.categoryChartInstance) {
      this.categoryChartInstance.destroy();
      this.categoryChartInstance = undefined;
    }
    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
      this.statusChartInstance = undefined;
    }
  }
}

