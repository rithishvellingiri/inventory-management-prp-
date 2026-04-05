import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { User } from './models/user.model';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
  userOnly?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    ChatbotComponent
  ],
  template: `
    <!-- ═══ AUTH PAGES: no shell ═══ -->
    <ng-container *ngIf="isAuthPage">
      <router-outlet></router-outlet>
    </ng-container>

    <!-- ═══ MAIN APP SHELL ═══ -->
    <div class="app-shell" *ngIf="!isAuthPage" [class.sidebar-collapsed]="sidebarCollapsed">

      <!-- ── Sidebar ───────────────────────────── -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">

        <!-- Logo -->
        <div class="sidebar-logo">
          <div class="logo-icon">
            <mat-icon>store</mat-icon>
          </div>
          <span class="logo-text" *ngIf="!sidebarCollapsed">PRP Stores</span>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <a class="nav-item"
             routerLink="/"
             [class.active]="activeRoute === '/'"
             [matTooltip]="sidebarCollapsed ? 'Home' : ''"
             matTooltipPosition="right">
            <mat-icon>home</mat-icon>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Home</span>
          </a>

          <ng-container *ngIf="currentUser">
            <a class="nav-item"
               routerLink="/products"
               [class.active]="activeRoute === '/products'"
               [matTooltip]="sidebarCollapsed ? 'Products' : ''"
               matTooltipPosition="right">
              <mat-icon>inventory_2</mat-icon>
              <span class="nav-label" *ngIf="!sidebarCollapsed">Products</span>
            </a>

            <a class="nav-item"
               *ngIf="!isAdmin"
               routerLink="/cart"
               [class.active]="activeRoute === '/cart'"
               [matTooltip]="sidebarCollapsed ? 'Cart' : ''"
               matTooltipPosition="right">
              <div class="nav-icon-wrap">
                <mat-icon>shopping_cart</mat-icon>
                <span class="cart-dot" *ngIf="cartCount > 0">{{cartCount}}</span>
              </div>
              <span class="nav-label" *ngIf="!sidebarCollapsed">Cart</span>
              <span class="cart-badge" *ngIf="!sidebarCollapsed && cartCount > 0">{{cartCount}}</span>
            </a>

            <a class="nav-item"
               *ngIf="isAdmin"
               routerLink="/admin"
               [class.active]="activeRoute === '/admin'"
               [matTooltip]="sidebarCollapsed ? 'Admin' : ''"
               matTooltipPosition="right">
              <mat-icon>admin_panel_settings</mat-icon>
              <span class="nav-label" *ngIf="!sidebarCollapsed">Admin Dashboard</span>
            </a>

            <a class="nav-item"
               *ngIf="!isAdmin"
               routerLink="/user-dashboard"
               [class.active]="activeRoute === '/user-dashboard'"
               [matTooltip]="sidebarCollapsed ? 'My Dashboard' : ''"
               matTooltipPosition="right">
              <mat-icon>dashboard</mat-icon>
              <span class="nav-label" *ngIf="!sidebarCollapsed">My Dashboard</span>
            </a>
          </ng-container>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer" *ngIf="!sidebarCollapsed && currentUser">
          <div class="user-card">
            <div class="user-avatar">{{getUserInitial()}}</div>
            <div class="user-info">
              <span class="user-name">{{currentUser.fullName}}</span>
              <span class="user-role">{{isAdmin ? 'Administrator' : 'Customer'}}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- ── Main Area ─────────────────────────── -->
      <div class="main-area">

        <!-- Top Navbar -->
        <header class="top-navbar">
          <button class="toggle-btn" (click)="toggleSidebar()" id="sidebar-toggle">
            <mat-icon>{{sidebarCollapsed ? 'menu_open' : 'menu'}}</mat-icon>
          </button>

          <div class="navbar-title">
            <span class="page-title">{{getPageTitle()}}</span>
          </div>

          <div class="navbar-right" *ngIf="currentUser">
            <!-- Cart icon in navbar (non-admin only) -->
            <a routerLink="/cart" class="navbar-icon-btn" *ngIf="!isAdmin" id="navbar-cart-btn">
              <mat-icon>shopping_cart</mat-icon>
              <span class="nb-badge" *ngIf="cartCount > 0">{{cartCount}}</span>
            </a>

            <!-- User menu -->
            <button class="user-menu-btn" [matMenuTriggerFor]="userMenu" id="user-menu-trigger">
              <div class="avatar-sm">{{getUserInitial()}}</div>
              <span class="nm-name">{{currentUser.fullName.split(' ')[0]}}</span>
              <mat-icon>expand_more</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" xPosition="before">
              <div class="menu-user-header">
                <div class="mu-avatar">{{getUserInitial()}}</div>
                <div>
                  <div class="mu-name">{{currentUser.fullName}}</div>
                  <div class="mu-email">{{currentUser.email}}</div>
                </div>
              </div>
              <div class="menu-divider"></div>
              <button mat-menu-item routerLink="{{isAdmin ? '/admin' : '/user-dashboard'}}">
                <mat-icon>dashboard</mat-icon>
                Dashboard
              </button>
              <button mat-menu-item routerLink="/products">
                <mat-icon>inventory_2</mat-icon>
                Browse Products
              </button>
              <div class="menu-divider"></div>
              <button mat-menu-item (click)="logout()" class="logout-item" id="logout-btn">
                <mat-icon>logout</mat-icon>
                Sign Out
              </button>
            </mat-menu>
          </div>

          <!-- Guest links -->
          <div class="navbar-right" *ngIf="!currentUser">
            <a routerLink="/login" class="nb-link" id="navbar-login-btn">Sign In</a>
            <a routerLink="/register" class="nb-btn-primary" id="navbar-register-btn">Get Started</a>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div><!-- /.main-area -->
    </div><!-- /.app-shell -->

    <!-- Chatbot -->
    <app-chatbot *ngIf="!isAuthPage"></app-chatbot>
  `,
  styles: [`
    /* ── Shell Layout ─────────────────────────────────── */
    .app-shell {
      display: flex;
      min-height: 100vh;
      background: var(--bg-base);
    }

    /* ── Sidebar ──────────────────────────────────────── */
    .sidebar {
      width: var(--sidebar-width);
      min-height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0; top: 0; bottom: 0;
      z-index: 200;
      transition: width var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: var(--sidebar-collapsed);
    }

    /* Logo */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid var(--border);
      min-height: var(--navbar-height);
      white-space: nowrap;
      overflow: hidden;
    }

    .logo-icon {
      width: 40px; height: 40px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px var(--primary-glow);
    }

    .logo-icon mat-icon { color: white; font-size: 22px; }

    .logo-text {
      font-size: 1.1rem; font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      animation: fadeIn 0.3s ease;
    }

    /* Nav Items */
    .sidebar-nav {
      flex: 1;
      padding: 16px 8px;
      display: flex; flex-direction: column; gap: 4px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 0.9rem; font-weight: 500;
      text-decoration: none;
      transition: all var(--transition-fast);
      white-space: nowrap; overflow: hidden;
      position: relative;
      cursor: pointer;
    }

    .nav-item mat-icon { font-size: 20px; flex-shrink: 0; transition: color var(--transition-fast); }

    .nav-item:hover {
      background: var(--bg-surface-2);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: rgba(108,99,255,0.15);
      color: var(--primary);
      border: 1px solid rgba(108,99,255,0.25);
    }

    .nav-item.active mat-icon { color: var(--primary); }

    .nav-item.active::before {
      content: '';
      position: absolute; left: 0; top: 25%; bottom: 25%;
      width: 3px;
      background: var(--primary);
      border-radius: 0 3px 3px 0;
    }

    .nav-label { animation: fadeIn 0.2s ease; }

    /* Cart badge */
    .nav-icon-wrap { position: relative; display: flex; }

    .cart-dot {
      position: absolute; top: -4px; right: -6px;
      background: var(--danger); color: white;
      font-size: 0.6rem; font-weight: 700;
      width: 16px; height: 16px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }

    .cart-badge {
      margin-left: auto;
      background: var(--danger);
      color: white;
      font-size: 0.65rem; font-weight: 700;
      padding: 2px 7px; border-radius: 99px;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border);
    }

    .user-card {
      display: flex; align-items: center; gap: 10px;
      padding: 10px; border-radius: var(--radius-sm);
      background: var(--bg-surface-2);
      overflow: hidden;
    }

    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; color: white;
      flex-shrink: 0;
    }

    .user-name {
      display: block; font-size: 0.85rem; font-weight: 600;
      color: var(--text-primary); white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis; max-width: 130px;
    }

    .user-role {
      display: block; font-size: 0.72rem; color: var(--text-muted);
    }

    /* ── Main Area ────────────────────────────────────── */
    .main-area {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex; flex-direction: column;
      min-height: 100vh;
      transition: margin-left var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-collapsed .main-area {
      margin-left: var(--sidebar-collapsed);
    }

    /* ── Top Navbar ───────────────────────────────────── */
    .top-navbar {
      height: var(--navbar-height);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 12px;
      padding: 0 24px;
      position: sticky; top: 0; z-index: 100;
      backdrop-filter: blur(12px);
    }

    .toggle-btn {
      width: 36px; height: 36px;
      background: none; border: none;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .toggle-btn:hover {
      background: var(--bg-surface-2);
      color: var(--primary);
    }

    .toggle-btn mat-icon { font-size: 20px; }

    .navbar-title { flex: 1; }

    .page-title {
      font-size: 1rem; font-weight: 600;
      color: var(--text-primary);
    }

    .navbar-right {
      display: flex; align-items: center; gap: 8px;
    }

    /* Navbar cart icon */
    .navbar-icon-btn {
      width: 38px; height: 38px;
      background: var(--bg-surface-2);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      text-decoration: none;
      position: relative;
      transition: all var(--transition-fast);
      border: 1px solid var(--border);
    }

    .navbar-icon-btn:hover { color: var(--primary); border-color: var(--primary); }
    .navbar-icon-btn mat-icon { font-size: 20px; }

    .nb-badge {
      position: absolute; top: -5px; right: -5px;
      background: var(--danger); color: white;
      font-size: 0.6rem; font-weight: 700;
      width: 17px; height: 17px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }

    /* User menu button */
    .user-menu-btn {
      display: flex; align-items: center; gap: 8px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 6px 12px 6px 8px;
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: 0.875rem; font-weight: 500;
      font-family: 'Inter', sans-serif;
    }

    .user-menu-btn:hover { border-color: var(--primary); }
    .user-menu-btn mat-icon { font-size: 18px; color: var(--text-muted); }

    .avatar-sm {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; color: white;
    }

    .nm-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Mat menu customizations */
    .menu-user-header {
      display: flex; align-items: center; gap: 12px;
      padding: 16px;
    }

    .mu-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; font-weight: 700; color: white;
      flex-shrink: 0;
    }

    .mu-name { font-weight: 600; color: var(--text-primary); font-size: 0.9rem; }
    .mu-email { font-size: 0.78rem; color: var(--text-muted); }

    .menu-divider { height: 1px; background: var(--border); margin: 4px 0; }

    .logout-item { color: var(--danger) !important; }

    /* Guest navbar links */
    .nb-link {
      color: var(--text-secondary); font-size: 0.875rem; font-weight: 500;
      padding: 6px 12px; border-radius: var(--radius-sm);
      transition: color var(--transition-fast);
      text-decoration: none;
    }
    .nb-link:hover { color: var(--primary); }

    .nb-btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white; font-size: 0.875rem; font-weight: 600;
      padding: 7px 16px; border-radius: var(--radius-sm);
      text-decoration: none;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .nb-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ── Page Content ─────────────────────────────────── */
    .page-content {
      flex: 1;
      padding: 0;
      animation: fadeInUp 0.35s ease;
    }

    /* ── Responsive ───────────────────────────────────── */
    @media (max-width: 1024px) {
      .sidebar { width: var(--sidebar-collapsed); }
      .sidebar .logo-text,
      .sidebar .nav-label,
      .sidebar .cart-badge,
      .sidebar .sidebar-footer { display: none; }
      .main-area { margin-left: var(--sidebar-collapsed); }
      .sidebar-collapsed .main-area { margin-left: var(--sidebar-collapsed); }
    }

    @media (max-width: 640px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.mobile-open { transform: translateX(0); width: var(--sidebar-width); }
      .sidebar.mobile-open .logo-text,
      .sidebar.mobile-open .nav-label { display: block; }
      .sidebar.mobile-open .sidebar-footer { display: block; }
      .main-area { margin-left: 0 !important; }
      .nm-name { display: none; }
      .top-navbar { padding: 0 16px; }
    }
  `]
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  cartCount = 0;
  sidebarCollapsed = false;
  isAuthPage = false;
  activeRoute = '/';

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

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.activeRoute = event.urlAfterRedirects;
      this.isAuthPage = ['/login', '/register'].includes(this.activeRoute);
    });

    // Set initial state
    this.activeRoute = this.router.url || '/';
    this.isAuthPage = ['/login', '/register'].includes(this.activeRoute);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  getUserInitial(): string {
    return this.currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U';
  }

  getPageTitle(): string {
    const titles: Record<string, string> = {
      '/': 'Home',
      '/products': 'Browse Products',
      '/cart': 'Shopping Cart',
      '/admin': 'Admin Dashboard',
      '/user-dashboard': 'My Dashboard',
    };
    return titles[this.activeRoute] || 'PRP Stores';
  }

  logout(): void {
    this.authService.logout();
  }
}
