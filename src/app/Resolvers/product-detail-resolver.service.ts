import { Injectable, inject } from '@angular/core';
import { ProductService } from '../Service/product.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductDetailResolverService {
  private productService = inject(ProductService);

  resolve(route: ActivatedRouteSnapshot): Observable<any> {

    const id = route.queryParams['productId'];

    return this.productService.getProductById(id).pipe(
      catchError(error => {
        return of(null);
      })
    );
  }
}
