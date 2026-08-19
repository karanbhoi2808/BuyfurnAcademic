import { Component, inject } from '@angular/core';
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
export class FurnitureComponent {
  private productService = inject(ProductService);


  filterText: string = '';

  search: string = '';


  onSearch() {
    this.productService.clearCache()
    this.search = this.filterText
  }




}
