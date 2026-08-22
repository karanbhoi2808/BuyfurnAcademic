import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../Service/product.service';
import { Product } from '../../Interface/product';
import { error } from 'console';

@Component({
  selector: 'app-similar-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './similar-products.component.html',
  styleUrl: './similar-products.component.css'
})
export class SimilarProductsComponent implements OnInit, OnChanges {
  private productService = inject(ProductService);
  private router = inject(Router);

  @Input() category: string = '';
  @Input() currentProductId: number | string | null = null;

  similarProducts: Product[] = [];
  isLoadingSimilar: boolean = false;

  ngOnInit(): void {
    this.loadSimilarProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] || changes['currentProductId']) {
      this.loadSimilarProducts();
    }
  }

  loadSimilarProducts(): void {
    this.isLoadingSimilar = true;
    const cat = this.category || '';

    this.productService.getAllProducts({ pageNumber: 0, pageSize: 6, searchCategory: cat }).subscribe({
      next: (data: any) => {
        this.isLoadingSimilar = false;
        let list: Product[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.products)) {
          list = data.products;
        } else if (data && Array.isArray(data.content)) {
          list = data.content;
        }

        // Filter out current product
        this.similarProducts = list.filter((p: any) => p.id !== Number(this.currentProductId)).slice(0, 3);
      },
      error: (error) => {
        this.isLoadingSimilar = false;
        console.error('Error loading similar products:', error);
      }
    });
  }

  viewProduct(id: any): void {
    this.router.navigate(['/product'], {
      queryParams: { productId: id }
    });
  }
}
