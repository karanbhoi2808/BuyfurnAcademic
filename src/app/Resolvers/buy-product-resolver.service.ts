import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, MaybeAsync, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Product } from '../Interface/product';
import { ProductSectionComponent } from '../Component/products-all-section/product-section.component';
import { ProductService } from '../Service/product.service';
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class BuyProductResolverService implements Resolve<Product[]> {

  constructor(private productService: ProductService, private router: Router) { }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<Product[]> {

    const id = route.queryParams['id'];
    const isSingleProductCheckout = route.queryParams['isSingleProductCheckout'] === 'true';
    return this.productService.getProductDetails(isSingleProductCheckout, id).pipe(
      catchError(error => {
        console.error('Error fetching product details:', error);
        Swal.fire("This product is not available, sorry!", '', 'error');
        this.router.navigate(['/furniture'])
        return of([]);
      })
    );
  }
}
