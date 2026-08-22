import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Product, ProductFilterParams, ProductPageResponse } from '../Interface/product';
import { OrderDetails } from '../Interface/orderdetails';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private httpclient = inject(HttpClient);

  private baseUrlAdmin = environment.baseUrlAdmin;
  private baseUrlLocal = environment.baseUrlLocal;

  addProduct(product: any, images: File[]): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('product', JSON.stringify(product));

    images.forEach((image) => {
      formData.append('imgs', image, image.name);
    });

    return this.httpclient.post(`${this.baseUrlAdmin}/add-product`, formData);
  }

  // Refactored getAllProducts supporting comprehensive filter params
  getAllProducts(
    paramsOrPageNumber?: ProductFilterParams | number,
    searchKey?: string,
    category?: string,
    pageSize?: number
  ): Observable<ProductPageResponse> {
    let params: ProductFilterParams = {};

    if (typeof paramsOrPageNumber === 'object' && paramsOrPageNumber !== null) {
      params = { ...paramsOrPageNumber };
    } else {
      params = {
        pageNumber: typeof paramsOrPageNumber === 'number' ? paramsOrPageNumber : 0,
        searchKey: searchKey || '',
        searchCategory: category || '',
        pageSize: pageSize ?? 12
      };
    }

    let httpParams = new HttpParams();

    if (params.pageNumber !== undefined && params.pageNumber !== null) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params.searchKey !== undefined && params.searchKey !== null) {
      httpParams = httpParams.set('searchKey', params.searchKey);
    }
    if (params.searchCategory !== undefined && params.searchCategory !== null) {
      if (Array.isArray(params.searchCategory)) {
        if (params.searchCategory.length > 0) {
          httpParams = httpParams.set('searchCategory', params.searchCategory.join(','));
        }
      } else if (params.searchCategory !== '') {
        httpParams = httpParams.set('searchCategory', params.searchCategory);
      }
    }
    if (params.minPrice !== undefined && params.minPrice !== null) {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined && params.maxPrice !== null) {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params.stockStatus !== undefined && params.stockStatus !== null && params.stockStatus !== '') {
      httpParams = httpParams.set('stockStatus', params.stockStatus);
    }
    if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy !== '') {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDir !== undefined && params.sortDir !== null && params.sortDir !== '') {
      httpParams = httpParams.set('sortDir', params.sortDir);
    }

    return this.httpclient.get<ProductPageResponse>(`${this.baseUrlLocal}/get-all-products`, {
      params: httpParams,
    });
  }

  // private latestProduct: Product[] | null = null; // Cached product data

  getLetestProducts(): Observable<any> {
    return this.httpclient.get(`${this.baseUrlLocal}/latest`);
  }

  // clearCache() {
  //   this.products = null; // Clear cached data
  //   this.latestProduct = null;
  // }

  getProductById(id: any): Observable<any> {
    return this.httpclient.get(`${this.baseUrlLocal}/get-by-id/${id}`);
  }

  deleteProductById(id: any): Observable<any> {
    return this.httpclient.delete(`${this.baseUrlAdmin}/delete-by-id/${id}`);
  }

  updateProduct(product: any, images: File[]): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('product', JSON.stringify(product));

    images.forEach((image) => {
      formData.append('img', image, image.name);
    });
    return this.httpclient.post(`${this.baseUrlAdmin}/update-product`, formData);
  }

  placeOrder(orderDetails: OrderDetails, isCartCheckout: boolean) {
    // console.log(isCartCheckout);

    return this.httpclient.post(
      `${this.baseUrlLocal}/user/placeOrder/${isCartCheckout}`,
      orderDetails
    );
  }

  addToCart(productId: any, quantity: any) {
    return this.httpclient.get(
      `${this.baseUrlLocal}/user/addToCart/${productId}/${quantity}`
    );
  }

  getCartDetails() {
    return this.httpclient.get(`${this.baseUrlLocal}/user/getCartDetails`);
  }

  getProductDetails(isSinbleProductCheckout: any, productId: any) {
    return this.httpclient.get<Product[]>(
      `${this.baseUrlLocal}/user/get-product-details/${isSinbleProductCheckout}/${productId}`
    );
  }

  removeCartProduct(id: any) {
    return this.httpclient.delete(
      `${this.baseUrlLocal}/user/deleteCartProduct/${id}`
    );
  }

  getAllOrderDetails(status: any) {
    return this.httpclient.get(`${this.baseUrlAdmin}/allOrders/${status}`);
  }

  markOrderAsDelivered(id: any) {
    return this.httpclient.put(
      `${this.baseUrlAdmin}/markAsDelivered/${id}`,
      id
    );
  }

  myOrders() {
    return this.httpclient.get(`${this.baseUrlLocal}/user/myOrders`);
  }

  createTransaction(amount: number) {
    return this.httpclient.get(
      `${this.baseUrlLocal}/user/createTransaction/${amount}`
    );
  }
}
