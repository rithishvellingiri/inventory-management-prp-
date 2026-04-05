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
  selector: 'app-register',
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

      <!-- Left Panel -->
      <div class="auth-left">
        <div class="brand-blobs">
          <div class="blob blob-1"></div>
          <div class="blob blob-2"></div>
          <div class="blob blob-3"></div>
        </div>
        <div class="brand-content">
          <div class="brand-logo"><mat-icon>store</mat-icon></div>
          <h1 class="brand-title">Join PRP Stores</h1>
          <p class="brand-subtitle">Create your account and start managing inventory like a pro.</p>
          <div class="steps">
            <div class="step" *ngFor="let s of steps; let i = index">
              <div class="step-num">{{i+1}}</div>
              <div>
                <div class="step-title">{{s.title}}</div>
                <div class="step-desc">{{s.desc}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="auth-right">
        <div class="auth-card animate-fade-up">

          <div class="auth-header">
            <h2 class="auth-title">Create Account</h2>
            <p class="auth-subtitle">Fill in your details to get started</p>
          </div>

          <form #registerForm="ngForm" (ngSubmit)="onSubmit()" class="auth-form">

            <div class="form-group">
              <label class="form-label">Full Name</label>
              <div class="input-wrap" [class.focused]="nameFocused" [class.filled]="fullName">
                <mat-icon class="input-icon">person</mat-icon>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="fullName"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  (focus)="nameFocused=true"
                  (blur)="nameFocused=false"
                  id="reg-name">
                <mat-icon class="valid-icon" *ngIf="fullName && fullName.length >= 2">check_circle</mat-icon>
              </div>
            </div>

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
                  id="reg-email">
                <mat-icon class="valid-icon" *ngIf="email && email.includes('@')">check_circle</mat-icon>
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
                  minlength="6"
                  placeholder="Min. 6 characters"
                  (focus)="pwFocused=true"
                  (blur)="pwFocused=false"
                  id="reg-password">
                <button type="button" class="eye-btn" (click)="hidePassword = !hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
              </div>
              <!-- Strength bar -->
              <div class="strength-bar" *ngIf="password">
                <div class="strength-track">
                  <div class="strength-fill" [style.width.%]="getStrength()" [class]="getStrengthClass()"></div>
                </div>
                <span class="strength-label" [class]="getStrengthClass()">{{getStrengthLabel()}}</span>
              </div>
            </div>

            <button
              type="submit"
              class="btn-submit"
              [disabled]="!registerForm.valid || isLoading"
              id="register-submit">
              <span class="btn-spinner" *ngIf="isLoading"></span>
              <mat-icon *ngIf="!isLoading">person_add</mat-icon>
              <span>{{isLoading ? 'Creating Account…' : 'Create Account'}}</span>
            </button>

          </form>

          <p class="auth-redirect">
            Already have an account?
            <a routerLink="/login" class="auth-link" id="go-login">Sign in</a>
          </p>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
      background: var(--bg-base);
    }

    /* Left — same blob layout */
    .auth-left {
      flex: 1;
      background: var(--bg-surface);
      position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      padding: 48px;
    }
    @media (max-width: 900px) { .auth-left { display: none; } }

    .brand-blobs { position: absolute; inset: 0; z-index: 0; }
    .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.20; animation: blobPulse 8s ease-in-out infinite; }
    .blob-1 { width: 400px; height: 400px; background: var(--secondary); top: -100px; left: -100px; animation-delay: 0s; }
    .blob-2 { width: 350px; height: 350px; background: var(--primary); bottom: -80px; right: -80px; animation-delay: 2.5s; }
    .blob-3 { width: 280px; height: 280px; background: var(--success); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 5s; }

    .brand-content { position: relative; z-index: 1; max-width: 420px; }

    .brand-logo {
      width: 60px; height: 60px;
      background: linear-gradient(135deg, var(--secondary), var(--primary));
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(0,210,255,0.3);
    }
    .brand-logo mat-icon { color: white; font-size: 30px; }

    .brand-title {
      font-size: 2.4rem; font-weight: 800;
      background: linear-gradient(135deg, var(--text-primary), var(--secondary));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 12px;
    }
    .brand-subtitle { font-size: 1rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 36px; }

    .steps { display: flex; flex-direction: column; gap: 20px; }
    .step { display: flex; align-items: flex-start; gap: 14px; }
    .step-num {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700; color: white;
      flex-shrink: 0;
    }
    .step-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .step-desc  { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

    /* Right */
    .auth-right {
      width: 480px;
      display: flex; align-items: center; justify-content: center;
      padding: 48px 40px;
    }
    @media (max-width: 900px) { .auth-right { width: 100%; padding: 32px 24px; } }

    .auth-card { width: 100%; max-width: 400px; }

    .auth-header { margin-bottom: 32px; }
    .auth-title  { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
    .auth-subtitle { font-size: 0.9rem; color: var(--text-muted); }

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
    .input-wrap.focused { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
    .input-wrap.filled  { border-color: var(--bg-surface-3); }

    .input-icon { color: var(--text-muted); font-size: 18px; flex-shrink: 0; }
    .input-wrap.focused .input-icon { color: var(--primary); }

    .form-input {
      flex: 1; background: none; border: none; outline: none;
      color: var(--text-primary); font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      padding: 13px 0;
    }
    .form-input::placeholder { color: var(--text-disabled); }

    .valid-icon { color: var(--success); font-size: 18px; animation: scaleIn 0.2s ease; }

    .eye-btn {
      background: none; border: none; padding: 4px;
      color: var(--text-muted); cursor: pointer;
      display: flex; align-items: center;
    }
    .eye-btn:hover { color: var(--primary); }
    .eye-btn mat-icon { font-size: 18px; }

    /* Strength Bar */
    .strength-bar { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
    .strength-track {
      flex: 1; height: 4px;
      background: var(--bg-surface-3);
      border-radius: 2px; overflow: hidden;
    }
    .strength-fill {
      height: 100%; border-radius: 2px;
      transition: width 0.3s ease, background 0.3s ease;
    }
    .strength-fill.weak   { background: var(--danger); }
    .strength-fill.medium { background: var(--warning); }
    .strength-fill.strong { background: var(--success); }

    .strength-label { font-size: 0.72rem; font-weight: 600; min-width: 44px; }
    .strength-label.weak   { color: var(--danger); }
    .strength-label.medium { color: var(--warning); }
    .strength-label.strong { color: var(--success); }

    /* Submit */
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
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px var(--primary-glow); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-submit mat-icon { font-size: 18px; }

    .btn-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .auth-redirect { text-align: center; font-size: 0.875rem; color: var(--text-muted); margin-top: 24px; }
    .auth-link { color: var(--primary); font-weight: 600; }
    .auth-link:hover { color: var(--primary-light); }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  hidePassword = true;
  isLoading = false;
  nameFocused = false;
  emailFocused = false;
  pwFocused = false;

  steps = [
    { title: 'Create your account',  desc: 'Takes less than a minute' },
    { title: 'Explore products',     desc: 'Browse our full catalogue' },
    { title: 'Place your first order', desc: 'Quick checkout with UPI' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  getStrength(): number {
    const p = this.password;
    let score = 0;
    if (p.length >= 6)  score += 33;
    if (p.length >= 10) score += 17;
    if (/[A-Z]/.test(p)) score += 17;
    if (/[0-9]/.test(p)) score += 17;
    if (/[^A-Za-z0-9]/.test(p)) score += 16;
    return Math.min(score, 100);
  }

  getStrengthClass(): string {
    const s = this.getStrength();
    if (s < 40) return 'weak';
    if (s < 75) return 'medium';
    return 'strong';
  }

  getStrengthLabel(): string {
    const s = this.getStrength();
    if (s < 40) return 'Weak';
    if (s < 75) return 'Medium';
    return 'Strong';
  }

  onSubmit(): void {
    this.isLoading = true;
    this.authService.register(this.email, this.password, this.fullName).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.snackBar.open('✓ ' + result.message + ' Please login.', 'Close', { duration: 4000 });
          this.router.navigate(['/login']);
        } else {
          this.snackBar.open(result.message, 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.message || 'Registration failed', 'Close', { duration: 3000 });
      }
    });
  }
}
