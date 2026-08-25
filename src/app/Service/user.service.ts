import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User } from '../Interface/user';
import { Observable, map } from 'rxjs';
import { UserAuthService } from './user-auth.service';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../Interface/api-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpClient = inject(HttpClient);
  private userAuthService = inject(UserAuthService);

  private baseUrlLocal = environment.baseUrlLocal;

  private unwrapResponse<T>(res: ApiResponse<T> | T | any): T {
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      return res.data;
    }
    return res;
  }

  login(): Observable<any> {
    return this.httpClient.get<ApiResponse<any> | any>(`${this.baseUrlLocal}/login`).pipe(
      map(res => this.unwrapResponse(res))
    );
  }

  roleMatch(allowroles: any[]): boolean {
    let isMatch = false;
    const userRoles: any[] = this.userAuthService.getRoles();

    if (userRoles != null && userRoles.length > 0) {
      for (let i = 0; i < userRoles.length; i++) {
        for (let j = 0; j < allowroles.length; j++) {
          if (userRoles[i] === allowroles[j]) {
            isMatch = true;
            return isMatch;
          }
          else {
            return isMatch;
          }
        }
      }
    }

    return isMatch;
  }

  register(user: User): Observable<any> {
    return this.httpClient.post<ApiResponse<any> | any>(`${this.baseUrlLocal}/register`, user).pipe(
      map(res => this.unwrapResponse(res))
    );
  }

  generateOtp(email: string): Observable<any> {
    return this.httpClient.post<ApiResponse<any> | any>(`${this.baseUrlLocal}/generate-otp`, { email }).pipe(
      map(res => this.unwrapResponse(res))
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.httpClient.post<ApiResponse<any> | any>(`${this.baseUrlLocal}/verify-otp`, { email, otp }).pipe(
      map(res => this.unwrapResponse(res))
    );
  }

  delteMyAccont(): Observable<any> {
    return this.httpClient.delete<ApiResponse<any> | any>(`${this.baseUrlLocal}/user/delete`).pipe(
      map(res => this.unwrapResponse(res))
    );
  }

  findByEmail(email: string): Observable<any> {
    return this.httpClient.get<ApiResponse<any> | any>(`${this.baseUrlLocal}/user/getByEmail/${email}`).pipe(
      map(res => this.unwrapResponse(res))
    );
  }

  updatePassword(user: any): Observable<any> {
    return this.httpClient.post<ApiResponse<any> | any>(`${this.baseUrlLocal}/updatepassword`, user).pipe(
      map(res => this.unwrapResponse(res))
    );
  }

  updateUser(user: any): Observable<any> {
    return this.httpClient.post<ApiResponse<any> | any>(`${this.baseUrlLocal}/user/updateuser`, user).pipe(
      map(res => this.unwrapResponse(res))
    );
  }
}

