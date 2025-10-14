import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
        <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>login</mat-icon>
            Login to Your Account
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form #loginForm="ngForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="password" name="password" required>
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="!loginForm.valid">
              Login
            </button>
          </form>

          <div class="auth-links">
            <p>Don't have an account? <a href="/register">Register here</a></p>
          </div>

          <div class="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Admin:</strong> admin&#64;inventory.com / admin123</p>
            <p><strong>User:</strong> user&#64;inventory.com / user123</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-card {
      max-width: 450px;
      width: 100%;
    }

    mat-card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .auth-links {
      text-align: center;
      margin-top: 1rem;
    }

    .auth-links a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .auth-links a:hover {
      text-decoration: underline;
    }

    .demo-credentials {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
      text-align: center;
    }

    .demo-credentials h4 {
      margin: 0 0 0.5rem 0;
      color: #666;
    }

    .demo-credentials p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }

    /* Dark theme only affects background, keeping text in light theme */
    /* :host ::ng-deep .dark-theme .demo-credentials {
      background-color: #424242;
    }

    :host ::ng-deep .dark-theme .demo-credentials h4,
    :host ::ng-deep .dark-theme .demo-credentials p {
      color: #e0e0e0;
    } */
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  onSubmit(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open(result.message, 'Close', { duration: 3000 });
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
        this.snackBar.open(error.message || 'Login failed', 'Close', { duration: 3000 });
      }
    });
  }
}
