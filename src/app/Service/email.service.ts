import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../Interface/api-response';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private httpClient = inject(HttpClient);

  private baseUrlLocal = environment.baseUrlLocal;

  private unwrapResponse<T>(res: ApiResponse<T> | T | any): T {
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      return res.data;
    }
    return res;
  }

  sendMail(email: any): Observable<any> {
    return this.httpClient.post<ApiResponse<any> | any>(`${this.baseUrlLocal}/send-email`, email).pipe(
      map(res => this.unwrapResponse(res))
    );
  }
}

