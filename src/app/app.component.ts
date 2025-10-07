import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { User } from './models/user.model';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    ChatbotComponent
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <button mat-button routerLink="/" class="logo-btn">
        <mat-icon>store</mat-icon>
        <span class="store-name">PRP Stores</span>
      </button>

      <span class="spacer"></span>

      <ng-container *ngIf="currentUser">
        <button mat-button routerLink="/products">Products</button>

        <button mat-button *ngIf="isAdmin" routerLink="/admin">Admin Dashboard</button>
        <button mat-button *ngIf="!isAdmin" routerLink="/user-dashboard">My Dashboard</button>

        <button mat-icon-button *ngIf="!isAdmin" routerLink="/cart" [matBadge]="cartCount" [matBadgeHidden]="cartCount === 0">
          <mat-icon>shopping_cart</mat-icon>
        </button>

        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
          {{currentUser.fullName}}
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-menu>
      </ng-container>

      <ng-container *ngIf="!currentUser">
        <button mat-button routerLink="/login">Login</button>
        <button mat-raised-button color="accent" routerLink="/register">Register</button>
      </ng-container>
    </mat-toolbar>

    <div class="content-wrapper">
      <router-outlet></router-outlet>
    </div>

    <!-- Chatbot -->
    <app-chatbot></app-chatbot>
  `,
  styles: [`
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .logo-btn {
      font-size: 1.2rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .store-name {
      margin-left: 0.5rem;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content-wrapper {
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }

  `]
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin;
    });

    this.cartService.cartItems.subscribe(() => {
      this.cartCount = this.cartService.cartCount;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
