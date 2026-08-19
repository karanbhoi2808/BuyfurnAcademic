import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User } from '../Interface/user';
import { Observable } from 'rxjs';
import { UserAuthService } from './user-auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpClient = inject(HttpClient);
  private userAuthService = inject(UserAuthService);

  private baseUrlLocal = environment.baseUrlLocal;

  login(): Observable<any> {
    return this.httpClient.get(`${this.baseUrlLocal}/login`);
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
    return this.httpClient.post(`${this.baseUrlLocal}/register`, user);
  }

  generateOtp(email: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrlLocal}/generate-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrlLocal}/verify-otp`, { email, otp });
  }

  delteMyAccont(): Observable<any> {
    return this.httpClient.delete(`${this.baseUrlLocal}/user/delete`);
  }

  findByEmail(email: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrlLocal}/user/getByEmail/${email}`);
  }

  updatePassword(user: any) {
    return this.httpClient.post(`${this.baseUrlLocal}/updatepassword`, user);
  }

  updateUser(user: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrlLocal}/user/updateuser`, user);
  }
}
