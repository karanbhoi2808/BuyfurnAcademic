import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Product } from '../Interface/product';
import { OrderDetails } from '../Interface/orderdetails';
import { environment } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrlAdmin = environment.baseUrlAdmin;
  private baseUrlLocal = environment.baseUrlLocal;

  constructor(private httpclient: HttpClient) { }

  addProduct(product: any, images: File[]): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('product', JSON.stringify(product));

    images.forEach((image) => {
      formData.append('imgs', image, image.name);
    });

    return this.httpclient.post(`${this.baseUrlAdmin}/addproduct`, formData);
  }

  private products: Product[] | null = null; // Cached product data
  getAllProducts(pageNumber: number, searchKey: string, category: string): Observable<any> {
    if (this.products) {
      return of(this.products); // Return cached products
    }
    else {
      return this.httpclient.get(`${this.baseUrlLocal}/getallproducts?pageNumber=${pageNumber}&searchKey=${searchKey}&searchCategory=${category}`).pipe(
        map((data: any) => {
          this.products = data; // Cache the data
          return data;
        }), catchError((error) => {
          console.error('Error fetching products', error);
          return of([]); // Handle error and return an empty array
        })
      );
    }
  }


  private latestProduct: Product[] | null = null; // Cached product data

  getLetestProducts(): Observable<any> {
    if (this.latestProduct) {
      return of(this.latestProduct)
    }
    else {
      return this.httpclient.get(`${this.baseUrlLocal}/latest`).pipe(
        map((data: any) => { this.latestProduct = data; return data }), catchError((error) => {
          console.error('Error fetching products', error);
          return of([]); // Handle error and return an empty array
        })
      );

    }
  }
  clearCache() {
    this.products = null; // Clear cached data
    this.latestProduct = null;
  }

  getProductById(id: any): Observable<any> {
    return this.httpclient.get(`${this.baseUrlLocal}/getbyid/${id}`)
  }

  deleteProductById(id: any): Observable<any> {
    return this.httpclient.delete(`${this.baseUrlAdmin}/deletebyid/${id}`)
  }

  updateProduct(product: any, images: File[]): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('product', JSON.stringify(product));

    images.forEach((image) => {
      formData.append('img', image, image.name);
    }); return this.httpclient.post(`${this.baseUrlAdmin}/updateproduct`, formData)
  }

  placeOrder(orderDetails: OrderDetails, isCartCheckout: boolean) {
    // console.log(isCartCheckout);

    return this.httpclient.post(`${this.baseUrlLocal}/user/placeOrder/${isCartCheckout}`, orderDetails)
  }

  addToCart(productId: any, quantity: any) {

    return this.httpclient.get(`${this.baseUrlLocal}/user/addToCart/${productId}/${quantity}`)
  }

  getCartDetails() {
    return this.httpclient.get(`${this.baseUrlLocal}/user/getCartDetails`)
  }

  getProductDetails(isSinbleProductCheckout: any, productId: any) {
    return this.httpclient.get<Product[]>(`${this.baseUrlLocal}/user/getproductdetails/${isSinbleProductCheckout}/${productId}`)
  }

  removeCartProduct(id: any) {
    return this.httpclient.delete(`${this.baseUrlLocal}/user/deleteCartProduct/${id}`);
  }


  getAllOrderDetails(status: any) {
    return this.httpclient.get(`${this.baseUrlAdmin}/allOrders/${status}`)
  }


  markOrderAsDelivered(id: any) {
    return this.httpclient.put(`${this.baseUrlAdmin}/markAsDelivered/${id}`, id)
  }


  myOrders() {
    return this.httpclient.get(`${this.baseUrlLocal}/user/myOrders`)
  }

  createTransaction(amount: number) {
    return this.httpclient.get(`${this.baseUrlLocal}/user/createTransaction/${amount}`)
  }
}
