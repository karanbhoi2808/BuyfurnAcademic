import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductFilterParams, ProductPageResponse } from '../Interface/product';
import { OrderAnalyticsResponse, OrderFilterParams, OrderPageResponse } from '../Interface/orderdetails';
import { UserFilterParams, UserPageResponse } from '../Interface/user';
import { DashboardCountsResponse } from '../Interface/dashboard';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private httpClient = inject(HttpClient);

  private baseUrlAdmin = environment.baseUrlAdmin;
  private baseUrlLocal = environment.baseUrlLocal;

  getDashboardCounts(): Observable<DashboardCountsResponse> {
    return this.httpClient.get<DashboardCountsResponse>(`${this.baseUrlAdmin}/dashboard/counts`);
  }

  getAllUsers(
    paramsOrPageNumber?: UserFilterParams | number,
    searchKey: string = '',
    pageSize: number = 10,
    sortBy: string = 'adminFirst',
    sortDir: string = 'desc'
  ): Observable<UserPageResponse | any> {
    let params: UserFilterParams = {};

    if (typeof paramsOrPageNumber === 'object' && paramsOrPageNumber !== null) {
      params = { ...paramsOrPageNumber };
    } else {
      params = {
        pageNumber: typeof paramsOrPageNumber === 'number' ? paramsOrPageNumber : 0,
        searchKey: searchKey || '',
        pageSize: pageSize ?? 10,
        sortBy: sortBy || 'adminFirst',
        sortDir: sortDir || 'desc'
      };
    }

    let httpParams = new HttpParams();

    if (params.pageNumber !== undefined && params.pageNumber !== null) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params.searchKey !== undefined && params.searchKey !== null && params.searchKey.trim() !== '') {
      httpParams = httpParams.set('searchKey', params.searchKey.trim());
    }
    if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy.trim() !== '') {
      httpParams = httpParams.set('sortBy', params.sortBy.trim());
    }
    if (params.sortDir !== undefined && params.sortDir !== null && params.sortDir.trim() !== '') {
      httpParams = httpParams.set('sortDir', params.sortDir.trim());
    }
    if (params.role !== undefined && params.role !== null && params.role !== 'ALL' && params.role.trim() !== '') {
      httpParams = httpParams.set('role', params.role.trim());
    }

    return this.httpClient.get<UserPageResponse>(`${this.baseUrlLocal}/getall`, {
      params: httpParams
    });
  }

  getAllProducts(
    paramsOrPageNumber?: ProductFilterParams | number,
    searchKey?: string,
    category?: string,
    pageSize?: number
  ): Observable<ProductPageResponse | any> {
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
    if (params.searchKey !== undefined && params.searchKey !== null && params.searchKey.trim() !== '') {
      httpParams = httpParams.set('searchKey', params.searchKey.trim());
    }
    if (params.searchCategory !== undefined && params.searchCategory !== null) {
      if (Array.isArray(params.searchCategory)) {
        if (params.searchCategory.length > 0) {
          httpParams = httpParams.set('searchCategory', params.searchCategory.join(','));
        }
      } else if (params.searchCategory.trim() !== '') {
        httpParams = httpParams.set('searchCategory', params.searchCategory.trim());
      }
    }
    if (params.minPrice !== undefined && params.minPrice !== null && (params.minPrice as any) !== '') {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined && params.maxPrice !== null && (params.maxPrice as any) !== '') {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params.stockStatus !== undefined && params.stockStatus !== null && params.stockStatus !== '' && params.stockStatus !== 'ALL') {
      httpParams = httpParams.set('stockStatus', params.stockStatus);
    }
    if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy !== '') {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDir !== undefined && params.sortDir !== null && params.sortDir !== '') {
      httpParams = httpParams.set('sortDir', params.sortDir);
    }

    return this.httpClient.get<ProductPageResponse>(`${this.baseUrlAdmin}/get-all-products-for-admin`, {
      params: httpParams
    });
  }

  getOrderAnalytics(status: string = 'all'): Observable<OrderAnalyticsResponse> {
    const params = new HttpParams().set('status', status);
    return this.httpClient.get<OrderAnalyticsResponse>(`${this.baseUrlAdmin}/orders/analytics`, {
      params
    });
  }

  getAllOrders(
    paramsOrPageNumber?: OrderFilterParams | number,
    status: string = 'all',
    searchKey: string = '',
    pageSize: number = 10,
    sortBy: string = 'createdDate',
    sortDir: string = 'desc'
  ): Observable<OrderPageResponse> {
    let params: OrderFilterParams = {};

    if (typeof paramsOrPageNumber === 'object' && paramsOrPageNumber !== null) {
      params = { ...paramsOrPageNumber };
    } else {
      params = {
        pageNumber: typeof paramsOrPageNumber === 'number' ? paramsOrPageNumber : 0,
        status: status || 'all',
        searchKey: searchKey || '',
        pageSize: pageSize ?? 10,
        sortBy: sortBy || 'createdDate',
        sortDir: sortDir || 'desc'
      };
    }

    let httpParams = new HttpParams();

    if (params.pageNumber !== undefined && params.pageNumber !== null) {
      httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params.status !== undefined && params.status !== null && params.status.trim() !== '') {
      httpParams = httpParams.set('status', params.status.trim());
    }
    if (params.searchKey !== undefined && params.searchKey !== null && params.searchKey.trim() !== '') {
      httpParams = httpParams.set('searchKey', params.searchKey.trim());
    }
    if (params.sortBy !== undefined && params.sortBy !== null && params.sortBy.trim() !== '') {
      httpParams = httpParams.set('sortBy', params.sortBy.trim());
    }
    if (params.sortDir !== undefined && params.sortDir !== null && params.sortDir.trim() !== '') {
      httpParams = httpParams.set('sortDir', params.sortDir.trim());
    }

    return this.httpClient.get<OrderPageResponse>(`${this.baseUrlAdmin}/allOrders`, {
      params: httpParams
    });
  }
}
