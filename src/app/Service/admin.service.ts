import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpClient: HttpClient) { }

  private baseUrlAdmin = environment.baseUrlAdmin;
  private baseUrlLocal = environment.baseUrlLocal;


  getAllUsers(): Observable<any> {
    return this.httpClient.get(`${this.baseUrlLocal}/getall`);
  }

  getAllProducts(pageNumber: number, searchKey: string, category: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrlAdmin}/getAllProductsForAdmin?pageNumber=${pageNumber}&searchKey=${searchKey}&searchCategory=${category}`);
  }
}
