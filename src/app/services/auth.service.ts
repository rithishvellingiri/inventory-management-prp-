import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private storageService: StorageService,
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

  register(email: string, password: string, fullName: string): { success: boolean; message: string } {
    const users = this.storageService.getUsers();

    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser: User = {
      id: this.storageService.generateId(),
      email,
      password,
      fullName,
      role: 'user',
      createdAt: new Date()
    };

    users.push(newUser);
    this.storageService.saveUsers(users);

    this.storageService.addHistory({
      id: this.storageService.generateId(),
      userId: newUser.id,
      userName: newUser.fullName,
      actionType: 'user_registration',
      description: `New user registered: ${newUser.fullName} (${newUser.email})`,
      createdAt: new Date()
    });

    return { success: true, message: 'Registration successful' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const users = this.storageService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);

      this.storageService.addHistory({
        id: this.storageService.generateId(),
        userId: user.id,
        userName: user.fullName,
        actionType: 'login',
        description: `${user.fullName} logged in`,
        createdAt: new Date()
      });

      return { success: true, message: 'Login successful' };
    }

    return { success: false, message: 'Invalid email or password' };
  }

  logout(): void {
    if (this.currentUserValue) {
      this.storageService.addHistory({
        id: this.storageService.generateId(),
        userId: this.currentUserValue.id,
        userName: this.currentUserValue.fullName,
        actionType: 'logout',
        description: `${this.currentUserValue.fullName} logged out`,
        createdAt: new Date()
      });
    }

    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
