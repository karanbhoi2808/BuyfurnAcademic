import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface GridColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  sortKey?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  headerClass?: string;
  cellClass?: string;
  formatter?: (value: any, row: T) => string;
}

@Component({
  selector: 'app-common-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './common-grid.component.html',
  styleUrl: './common-grid.component.css'
})
export class CommonGridComponent {
  @Input() columns: GridColumn[] = [];
  @Input() data: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() totalElements: number = 0;
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() totalPages: number = 0;
  @Input() showPagination: boolean = true;
  @Input() emptyTitle: string = 'No Records Found';
  @Input() emptyMessage: string = 'No data matching your current filters or query.';
  @Input() emptyIcon: string = 'bi-inbox';
  @Input() showEmptyAction: boolean = false;
  @Input() emptyActionLabel: string = 'Reset Filters';
  @Input() itemLabel: string = 'records';
  @Input() currentSortBy?: string;
  @Input() currentSortDir: 'asc' | 'desc' = 'desc';
  @Input() rowClickable: boolean = false;
  @Input() tableClass: string = '';
  @Input() cellTemplates: { [key: string]: TemplateRef<any> } = {};

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ sortBy: string; sortDir: 'asc' | 'desc' }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() emptyAction = new EventEmitter<void>();

  onSort(col: GridColumn): void {
    if (!col.sortable) return;
    const sortKey = col.sortKey || col.key;
    let nextDir: 'asc' | 'desc' = 'asc';

    if (this.currentSortBy === sortKey) {
      nextDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
    }

    this.sortChange.emit({ sortBy: sortKey, sortDir: nextDir });
  }

  onRowClick(row: any): void {
    if (this.rowClickable) {
      this.rowClick.emit(row);
    }
  }

  onPageSizeChange(newSize: any): void {
    this.pageSizeChange.emit(Number(newSize));
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
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

  getStartIndex(): number {
    if (this.totalElements === 0) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  getEndIndex(): number {
    const calculated = (this.currentPage + 1) * this.pageSize;
    return calculated > this.totalElements ? this.totalElements : calculated;
  }
}
