import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private httpClient = inject(HttpClient);



  private baseUrlLocal = environment.baseUrlLocal;

  sendMail(email: EmailService) {
    return this.httpClient.post(`${this.baseUrlLocal}/send-email`, email)
  }
}
