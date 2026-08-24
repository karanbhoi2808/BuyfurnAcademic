import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService } from '../../Service/admin.service';
import {
  UserAccount,
  UserFilterParams,
  UserPageResponse
} from '../../Interface/user';
import { CommonGridComponent, GridColumn } from '../../Component/common-grid/common-grid.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonGridComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);

  users: UserAccount[] = [];
  isLoading: boolean = false;
  isSortDropdownOpen: boolean = false;

  // Columns definition for Common Grid
  columns: GridColumn<UserAccount>[] = [
    { key: 'user', header: 'User' },
    { key: 'contact', header: 'Contact Info' },
    { key: 'address', header: 'Location / Address' },
    { key: 'roles', header: 'Role & Permissions' },
    { key: 'status', header: 'Account Status' },
    { key: 'actions', header: 'Actions', align: 'right', headerClass: 'pe-4', cellClass: 'pe-4' }
  ];

  // Filters & Controls
  searchTerm: string = '';
  selectedRoleFilter: 'ALL' | 'ADMIN' | 'USER' = 'ALL';
  sortBy: 'adminFirst' | 'name-asc' | 'name-desc' = 'name-asc';

  sortOptions = [
    { label: 'Name (A to Z)', value: 'name-asc' },
    { label: 'Name (Z to A)', value: 'name-desc' }
  ];

  // Pagination State
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // KPI Metrics
  totalUsers: number = 0;
  adminCount: number = 0;
  customerCount: number = 0;

  // User detail modal / drawer
  selectedUser: UserAccount | null = null;
  copiedEmail: string | null = null;

  // Search Debounce
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private avatarColors: string[] = [
    '#1e3a2b',
    '#059669',
    '#2563eb',
    '#7c3aed',
    '#b45309',
    '#db2777',
    '#0891b2',
    '#4f46e5'
  ];

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.getAllUsers();
    });

    this.getAllUsers(0);
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  getAllUsers(pageNumber: number = this.currentPage): void {
    this.currentPage = pageNumber;
    this.isLoading = true;

    let sortParam = 'adminFirst';
    let sortDirParam = 'desc';

    if (this.sortBy === 'name-asc') {
      sortParam = 'name';
      sortDirParam = 'asc';
    } else if (this.sortBy === 'name-desc') {
      sortParam = 'name';
      sortDirParam = 'desc';
    } else if (this.sortBy === 'adminFirst') {
      sortParam = 'adminFirst';
      sortDirParam = 'desc';
    }

    const params: UserFilterParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchKey: this.searchTerm.trim(),
      sortBy: sortParam,
      sortDir: sortDirParam,
      role: this.selectedRoleFilter !== 'ALL' ? this.selectedRoleFilter : undefined
    };

    this.adminService.getAllUsers(params).subscribe({
      next: (response: UserPageResponse | any) => {
        this.isLoading = false;
        if (response && response.users) {
          this.users = response.users.map((u: any, index: number) => ({
            id: u.id || u.userId || index + 1,
            name: u.name || u.username || 'Unnamed User',
            email: u.email || 'No email provided',
            roles: Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : ['USER']),
            contactNumber: u.contactNumber || u.contact || '',
            address: u.address || null,
            ...u
          }));
          this.totalUsers = response.totalUsers ?? this.users.length;
          this.adminCount = response.administratorsCount ?? this.users.filter(u => this.hasAdminRole(u)).length;
          this.customerCount = response.customersCount ?? this.users.filter(u => !this.hasAdminRole(u)).length;
          this.totalPages = response.totalPages ?? 1;
          this.currentPage = response.currentPage ?? 0;
        } else if (Array.isArray(response)) {
          this.users = response.map((u: any, index: number) => ({
            id: u.id || u.userId || index + 1,
            name: u.name || u.username || 'Unnamed User',
            email: u.email || 'No email provided',
            roles: Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : ['USER']),
            contactNumber: u.contactNumber || u.contact || '',
            address: u.address || null,
            ...u
          }));
          this.totalUsers = this.users.length;
          this.adminCount = this.users.filter(u => this.hasAdminRole(u)).length;
          this.customerCount = this.users.filter(u => !this.hasAdminRole(u)).length;
          this.totalPages = Math.ceil(this.users.length / this.pageSize) || 1;
        } else {
          this.users = [];
          this.totalUsers = 0;
          this.adminCount = 0;
          this.customerCount = 0;
          this.totalPages = 0;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching users:', error);
        this.users = [];
        this.totalPages = 0;
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.getAllUsers();
  }

  filterByRole(role: 'ALL' | 'ADMIN' | 'USER'): void {
    this.selectedRoleFilter = role;
    this.currentPage = 0;
    this.getAllUsers();
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
    this.changeSort(sortVal);
  }

  getSortLabel(): string {
    const opt = this.sortOptions.find((o) => o.value === this.sortBy);
    return opt ? opt.label : 'Name (A to Z)';
  }

  changeSort(sort: 'adminFirst' | 'name-asc' | 'name-desc'): void {
    this.sortBy = sort;
    this.currentPage = 0;
    this.getAllUsers();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.getAllUsers();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getAllUsers(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  hasAdminRole(user: UserAccount): boolean {
    return (user.roles || []).some(
      (r) => r.toUpperCase().includes('ADMIN') || r.toUpperCase() === 'ROLE_ADMIN'
    );
  }

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  selectUser(user: UserAccount): void {
    this.selectedUser = user;
  }

  closeModal(): void {
    this.selectedUser = null;
  }

  copyToClipboard(text: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedEmail = text;
        setTimeout(() => {
          this.copiedEmail = null;
        }, 2000);
      });
    }
  }
}
