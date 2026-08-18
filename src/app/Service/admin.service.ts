import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private httpClient = inject(HttpClient);


  private baseUrlAdmin = environment.baseUrlAdmin;
  private baseUrlLocal = environment.baseUrlLocal;


  getAllUsers(): Observable<any> {
    return this.httpClient.get(`${this.baseUrlLocal}/getall`);
  }

  getAllProducts(pageNumber: number, searchKey: string, category: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrlAdmin}/getAllProductsForAdmin?pageNumber=${pageNumber}&searchKey=${searchKey}&searchCategory=${category}`);
  }
}
