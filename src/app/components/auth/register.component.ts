import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
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
            <mat-icon>person_add</mat-icon>
            Create New Account
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form #registerForm="ngForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput type="text" [(ngModel)]="fullName" name="fullName" required>
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

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

            <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="!registerForm.valid">
              Register
            </button>
          </form>

          <div class="auth-links">
            <p>Already have an account? <a href="/login">Login here</a></p>
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
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    const result = this.authService.register(this.email, this.password, this.fullName);

    if (result.success) {
      this.snackBar.open(result.message + '. Please login.', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
    } else {
      this.snackBar.open(result.message, 'Close', { duration: 3000 });
    }
  }
}
