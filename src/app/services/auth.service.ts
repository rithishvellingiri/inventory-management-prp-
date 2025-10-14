import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = 'https://inventory-management-prp.onrender.com/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  register(email: string, password: string, fullName: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, {
      email,
      password,
      fullName
    }).pipe(
      map(response => {
        if (response.success) {
          // Store user and token
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
        return { success: response.success, message: response.message };
      }),
      catchError(error => {
        const message = error.error?.message || 'Registration failed';
        return throwError(() => ({ success: false, message }));
      })
    );
  }

  login(email: string, password: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      map(response => {
        if (response.success) {
          // Store user and token
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
        return { success: response.success, message: response.message };
      }),
      catchError(error => {
        const message = error.error?.message || 'Login failed';
        return throwError(() => ({ success: false, message }));
      })
    );
  }

  logout(): void {
    // Call backend logout endpoint
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post(`${this.apiUrl}/auth/logout`, {}, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }).subscribe({
        next: () => console.log('Logged out successfully'),
        error: (error) => console.error('Logout error:', error)
      });
    }

    // Clear local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Helper method to get auth headers
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
