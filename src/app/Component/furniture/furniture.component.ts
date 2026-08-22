import { Component, OnInit, inject } from '@angular/core';
import { ProductSectionComponent } from '../products-all-section/product-section.component';

import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { ProductService } from '../../Service/product.service';

@Component({
  selector: 'app-furniture',
  imports: [ProductSectionComponent, FormsModule],
  templateUrl: './furniture.component.html',
  styleUrl: './furniture.component.css'
})
export class FurnitureComponent implements OnInit {
  private productService = inject(ProductService);

  filterText: string = '';
  search: string = '';
  recentSearches: string[] = [];

  ngOnInit(): void {
    this.loadRecentSearches();
  }

  loadRecentSearches() {
    try {
      const stored = localStorage.getItem('bf_recent_searches');
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      } else {
        this.recentSearches = ['Sofa', 'Chair', 'Dining Table', 'Recliner'];
        localStorage.setItem('bf_recent_searches', JSON.stringify(this.recentSearches));
      }
    } catch (e) {
      this.recentSearches = ['Sofa', 'Chair', 'Table'];
    }
  }

  saveRecentSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;

    this.recentSearches = this.recentSearches.filter(
      item => item.toLowerCase() !== trimmed.toLowerCase()
    );
    this.recentSearches.unshift(trimmed);
    this.recentSearches = this.recentSearches.slice(0, 5);

    try {
      localStorage.setItem('bf_recent_searches', JSON.stringify(this.recentSearches));
    } catch (e) {
      console.error(e);
    }
  }

  onSearch() {
    if (this.filterText) {
      this.saveRecentSearch(this.filterText);
    }
    // this.productService.clearCache();
    this.search = this.filterText;
  }

  quickSearch(term: string) {
    this.filterText = term;
    this.onSearch();
  }

  removeRecentSearch(term: string, event: Event) {
    event.stopPropagation();
    this.recentSearches = this.recentSearches.filter(
      item => item.toLowerCase() !== term.toLowerCase()
    );
    try {
      localStorage.setItem('bf_recent_searches', JSON.stringify(this.recentSearches));
    } catch (e) {
      console.error(e);
    }
  }

  clearSearch() {
    this.filterText = '';
    this.onSearch();
  }
}
