import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3030/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }

  register(userData: { name: string, email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(tap(() => {
        this.isAuthenticatedSubject.next(true);
      }));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => {
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
      }));
  }

  sendOtp(): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-otp`, {}, { withCredentials: true });
  }

  verifyOtp(otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-account`, { otp }, { withCredentials: true });
  }

  resendOtp(): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, {}, { withCredentials: true });
  }

  resetPassword(newPass: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-pass`, { newPass }, { withCredentials: true });
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getToken(): string | null {
    // Note: Since you're using httpOnly cookies, you don't need to handle tokens in frontend
    // This is just for demonstration if you need to check auth status
    return localStorage.getItem('auth_token'); // Not used in your case, but kept for structure
  }
}