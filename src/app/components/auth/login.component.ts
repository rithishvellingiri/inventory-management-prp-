import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink
  ],
  template: `
    <div class="auth-page">

      <!-- Left Panel — Branding -->
      <div class="auth-left">
        <div class="brand-blobs">
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
          <div class="blob blob-3"></div>
        </div>
        <div class="brand-content">
          <div class="brand-logo">
            <mat-icon>store</mat-icon>
          </div>
          <h1 class="brand-title">PRP Stores</h1>
          <p class="brand-subtitle">The modern inventory & e-commerce platform built for speed, clarity, and control.</p>

          <div class="brand-features">
            <div class="bf-item" *ngFor="let f of features">
              <div class="bf-icon"><mat-icon>{{f.icon}}</mat-icon></div>
              <div>
                <div class="bf-title">{{f.title}}</div>
                <div class="bf-desc">{{f.desc}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel — Form -->
      <div class="auth-right">
        <div class="auth-card animate-fade-up">

          <div class="auth-header">
            <h2 class="auth-title">Welcome back</h2>
            <p class="auth-subtitle">Sign in to your account to continue</p>
          </div>

          <form #loginForm="ngForm" (ngSubmit)="onSubmit()" class="auth-form">

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-wrap" [class.focused]="emailFocused" [class.filled]="email">
                <mat-icon class="input-icon">email</mat-icon>
                <input
                  type="email"
                  class="form-input"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  (focus)="emailFocused=true"
                  (blur)="emailFocused=false"
                  id="login-email">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrap" [class.focused]="pwFocused" [class.filled]="password">
                <mat-icon class="input-icon">lock</mat-icon>
                <input
                  [type]="hidePassword ? 'password' : 'text'"
                  class="form-input"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  (focus)="pwFocused=true"
                  (blur)="pwFocused=false"
                  id="login-password">
                <button type="button" class="eye-btn" (click)="hidePassword = !hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="btn-submit"
              [disabled]="!loginForm.valid || isLoading"
              id="login-submit">
              <span class="btn-spinner" *ngIf="isLoading"></span>
              <mat-icon *ngIf="!isLoading">login</mat-icon>
              <span>{{isLoading ? 'Signing in…' : 'Sign In'}}</span>
            </button>

          </form>

          <div class="auth-divider"><span>Demo Credentials</span></div>

          <div class="demo-creds">
            <div class="cred-pill" (click)="fillAdmin()">
              <mat-icon>admin_panel_settings</mat-icon>
              <div>
                <div class="cp-title">Admin</div>
                <div class="cp-email">admin&#64;inventory.com</div>
              </div>
            </div>
            <div class="cred-pill" (click)="fillUser()">
              <mat-icon>person</mat-icon>
              <div>
                <div class="cp-title">User</div>
                <div class="cp-email">user&#64;inventory.com</div>
              </div>
            </div>
          </div>

          <p class="auth-redirect">
            Don't have an account?
            <a routerLink="/register" class="auth-link" id="go-register">Create one</a>
          </p>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Page Layout ────────────────────────── */
    .auth-page {
      display: flex;
      min-height: 100vh;
      background: var(--bg-base);
    }

    /* ── Left Panel ─────────────────────────── */
    .auth-left {
      flex: 1;
      background: var(--bg-surface);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }

    @media (max-width: 900px) { .auth-left { display: none; } }

    /* Animated blobs */
    .brand-blobs { position: absolute; inset: 0; z-index: 0; }

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.25;
      animation: blobPulse 8s ease-in-out infinite;
    }
    .blob-1 {
      width: 400px; height: 400px;
      background: var(--primary);
      top: -100px; left: -100px;
      animation-delay: 0s;
    }
    .blob-2 {
      width: 350px; height: 350px;
      background: var(--secondary);
      bottom: -80px; right: -80px;
      animation-delay: 2.5s;
    }
    .blob-3 {
      width: 280px; height: 280px;
      background: var(--accent);
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      animation-delay: 5s;
    }

    .brand-content {
      position: relative; z-index: 1;
      max-width: 420px;
    }

    .brand-logo {
      width: 60px; height: 60px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px var(--primary-glow);
    }
    .brand-logo mat-icon { color: white; font-size: 30px; }

    .brand-title {
      font-size: 2.4rem; font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 12px;
      background: linear-gradient(135deg, var(--text-primary), var(--primary-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-subtitle {
      font-size: 1rem; color: var(--text-muted);
      line-height: 1.7; margin-bottom: 36px;
    }

    .brand-features { display: flex; flex-direction: column; gap: 20px; }

    .bf-item {
      display: flex; align-items: flex-start; gap: 14px;
    }

    .bf-icon {
      width: 38px; height: 38px;
      background: rgba(108,99,255,0.15);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .bf-icon mat-icon { color: var(--primary); font-size: 20px; }

    .bf-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .bf-desc  { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

    /* ── Right Panel ─────────────────────────── */
    .auth-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
      background: var(--bg-base);
    }

    @media (max-width: 900px) {
      .auth-right { width: 100%; padding: 32px 24px; }
    }

    .auth-card { width: 100%; max-width: 400px; }

    .auth-header { margin-bottom: 32px; }
    .auth-title { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
    .auth-subtitle { font-size: 0.9rem; color: var(--text-muted); }

    /* ── Form ────────────────────────────────── */
    .auth-form { display: flex; flex-direction: column; gap: 20px; }

    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { font-size: 0.825rem; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.02em; }

    .input-wrap {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0 12px;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .input-wrap.focused {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(108,99,255,0.15);
    }

    .input-wrap.filled { border-color: var(--bg-surface-3); }

    .input-icon { color: var(--text-muted); font-size: 18px; flex-shrink: 0; }
    .input-wrap.focused .input-icon { color: var(--primary); }

    .form-input {
      flex: 1; background: none; border: none; outline: none;
      color: var(--text-primary); font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      padding: 13px 0;
    }
    .form-input::placeholder { color: var(--text-disabled); }

    .eye-btn {
      background: none; border: none; padding: 4px;
      color: var(--text-muted); cursor: pointer;
      display: flex; align-items: center;
      transition: color var(--transition-fast);
    }
    .eye-btn:hover { color: var(--primary); }
    .eye-btn mat-icon { font-size: 18px; }

    /* Submit Button */
    .btn-submit {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border: none; border-radius: var(--radius-sm);
      color: white; font-size: 0.95rem; font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 20px var(--primary-glow);
      margin-top: 8px;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px var(--primary-glow);
    }

    .btn-submit:disabled {
      opacity: 0.5; cursor: not-allowed;
      transform: none; box-shadow: none;
    }

    .btn-submit mat-icon { font-size: 18px; }

    .btn-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* Divider */
    .auth-divider {
      display: flex; align-items: center; gap: 12px;
      margin: 28px 0 16px;
      color: var(--text-muted); font-size: 0.78rem;
    }
    .auth-divider::before, .auth-divider::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }

    /* Demo Credentials */
    .demo-creds { display: flex; gap: 12px; margin-bottom: 24px; }

    .cred-pill {
      flex: 1; display: flex; align-items: center; gap: 10px;
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .cred-pill:hover {
      border-color: var(--primary);
      background: rgba(108,99,255,0.08);
    }

    .cred-pill mat-icon { color: var(--primary); font-size: 20px; flex-shrink: 0; }
    .cp-title { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
    .cp-email { font-size: 0.72rem; color: var(--text-muted); }

    /* Redirect */
    .auth-redirect { text-align: center; font-size: 0.875rem; color: var(--text-muted); }
    .auth-link { color: var(--primary); font-weight: 600; transition: color var(--transition-fast); }
    .auth-link:hover { color: var(--primary-light); }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = true;
  isLoading = false;
  emailFocused = false;
  pwFocused = false;

  features = [
    { icon: 'inventory_2',   title: 'Real-time Inventory',  desc: 'Track stock levels across all products instantly' },
    { icon: 'shopping_bag',  title: 'Order Management',     desc: 'Manage and track all customer orders in one place' },
    { icon: 'analytics',     title: 'Insightful Analytics', desc: 'Get data-driven insights with visual dashboards' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  fillAdmin(): void {
    this.email = 'admin@inventory.com';
    this.password = 'admin123';
  }

  fillUser(): void {
    this.email = 'user@inventory.com';
    this.password = 'user123';
  }

  onSubmit(): void {
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.snackBar.open('✓ ' + result.message, 'Close', { duration: 3000 });
          if (this.authService.isAdmin) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/products']);
          }
        } else {
          this.snackBar.open(result.message, 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 3000 });
      }
    });
  }
}
