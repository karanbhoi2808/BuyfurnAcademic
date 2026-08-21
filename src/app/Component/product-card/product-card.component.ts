import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  readonly product = input.required<any>();
  private router = inject(Router);

  productDetailPage(id: any) {
    this.router.navigate(['/product'], {
      queryParams: {
        productId: id
      }
    });
  }

  getSubtitle(): string {
    const p = this.product();
    if (!p) return 'Premium handcrafted furniture';
    if (p.material && p.category) {
      return `${p.material} • ${p.category}`;
    }
    if (p.material) {
      return p.material;
    }
    if (p.category) {
      return p.category;
    }
    return 'Premium handcrafted furniture';
  }
}
