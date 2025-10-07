import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="home-container">
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="store-title">Welcome to Our PRP Store</h1>
          <p class="store-subtitle">Your One-Stop Shop for Everything You Need</p>
          <div class="hero-actions">
            <button mat-raised-button color="primary" routerLink="/products" *ngIf="isLoggedIn">
              Browse Products
            </button>
            <button mat-raised-button color="accent" routerLink="/register" *ngIf="!isLoggedIn">
              Get Started
            </button>
          </div>
        </div>
      </section>

      <section class="about-section">
        <div class="section-container">
          <h2>About Us</h2>
          <p class="about-text">
            We are a leading departmental store committed to providing high-quality products at competitive prices.
            Our extensive range includes electronics, groceries, clothing, home & kitchen items, and much more.
            With years of experience in retail, we understand what our customers need and strive to exceed expectations.
          </p>
        </div>
      </section>

      <section class="features-section">
        <div class="section-container">
          <h2>Why Choose Our Store?</h2>
          <div class="features-grid">
            <mat-card class="feature-card">
              <mat-icon color="primary">inventory_2</mat-icon>
              <h3>Wide Selection</h3>
              <p>Thousands of products across multiple categories to meet all your needs</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon color="primary">payments</mat-icon>
              <h3>Secure Payments</h3>
              <p>Safe and secure payment processing through Razorpay for your peace of mind</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon color="primary">local_shipping</mat-icon>
              <h3>Fast Delivery</h3>
              <p>Quick order processing and reliable delivery to your doorstep</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon color="primary">support_agent</mat-icon>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support with AI-powered chatbot assistance</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon color="primary">verified</mat-icon>
              <h3>Quality Assured</h3>
              <p>All products are sourced from trusted suppliers and quality checked</p>
            </mat-card>

            <mat-card class="feature-card">
              <mat-icon color="primary">currency_rupee</mat-icon>
              <h3>Best Prices</h3>
              <p>Competitive pricing and regular discounts on popular items</p>
            </mat-card>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      width: 100%;
    }

    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6rem 2rem;
      text-align: center;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .store-title {
      font-size: 3rem;
      margin: 0 0 1rem 0;
      font-weight: 700;
    }

    .store-subtitle {
      font-size: 1.5rem;
      margin: 0 0 2rem 0;
      opacity: 0.95;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-actions button {
      font-size: 1.1rem;
      padding: 0.5rem 2rem;
    }

    .about-section,
    .features-section {
      padding: 4rem 2rem;
    }

    .section-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }

    .about-text {
      font-size: 1.1rem;
      line-height: 1.8;
      text-align: center;
      max-width: 900px;
      margin: 0 auto;
      color: #555;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .feature-card {
      text-align: center;
      padding: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }

    .feature-card mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      margin: 1rem 0;
      color: #333;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
    }

    /* Dark theme only affects background, keeping text in light theme */
    /* :host ::ng-deep .dark-theme h2,
    :host ::ng-deep .dark-theme .feature-card h3 {
      color: #e0e0e0;
    }

    :host ::ng-deep .dark-theme .about-text,
    :host ::ng-deep .dark-theme .feature-card p {
      color: #b0b0b0;
    } */

    @media (max-width: 768px) {
      .store-title {
        font-size: 2rem;
      }

      .store-subtitle {
        font-size: 1.2rem;
      }

      h2 {
        font-size: 2rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  isLoggedIn = false;

  constructor(private authService: AuthService) {
    this.isLoggedIn = this.authService.isLoggedIn;
  }
}
