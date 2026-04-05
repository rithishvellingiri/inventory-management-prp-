import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="home-wrap">

      <!-- ── HERO ──────────────────────────────────── -->
      <section class="hero">
        <div class="hero-blobs">
          <div class="hblob hblob-1"></div>
          <div class="hblob hblob-2"></div>
        </div>
        <div class="hero-inner">
          <span class="hero-chip">
            <mat-icon>auto_awesome</mat-icon>
            Inventory Management Reimagined
          </span>
          <h1 class="hero-title">
            Your Complete<br>
            <span class="gradient-text">Store Dashboard</span>
          </h1>
          <p class="hero-desc">
            Manage products, track orders, and grow your business with a
            modern, blazing-fast inventory platform designed for teams of all sizes.
          </p>
          <div class="hero-actions">
            <a routerLink="/products" class="btn-hero-primary" *ngIf="isLoggedIn" id="hero-browse-btn">
              <mat-icon>inventory_2</mat-icon>
              Browse Products
            </a>
            <a routerLink="/register" class="btn-hero-primary" *ngIf="!isLoggedIn" id="hero-start-btn">
              <mat-icon>rocket_launch</mat-icon>
              Get Started Free
            </a>
            <a routerLink="/login" class="btn-hero-outline" *ngIf="!isLoggedIn" id="hero-login-btn">
              Sign In
            </a>
            <a routerLink="/user-dashboard" class="btn-hero-outline" *ngIf="isLoggedIn" id="hero-dashboard-btn">
              <mat-icon>dashboard</mat-icon>
              My Dashboard
            </a>
          </div>

          <!-- Stats Row -->
          <div class="stats-row">
            <div class="stat" *ngFor="let s of stats">
              <div class="stat-value gradient-text">{{s.v}}</div>
              <div class="stat-label">{{s.l}}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── FEATURES ───────────────────────────────── -->
      <section class="features-section">
        <div class="section-inner">
          <div class="section-badge">
            <mat-icon>star</mat-icon>
            Features
          </div>
          <h2 class="section-title">Why Choose <span class="gradient-text">PRP Stores?</span></h2>
          <p class="section-desc">Everything you need to run a modern retail operation, all in one place.</p>

          <div class="features-grid stagger-children">
            <div class="feature-card animate-fade-up" *ngFor="let f of features">
              <div class="fc-icon" [style.background]="f.bg">
                <mat-icon [style.color]="f.color">{{f.icon}}</mat-icon>
              </div>
              <h3 class="fc-title">{{f.title}}</h3>
              <p class="fc-desc">{{f.desc}}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── HOW IT WORKS ───────────────────────────── -->
      <section class="how-section">
        <div class="section-inner">
          <div class="section-badge">
            <mat-icon>route</mat-icon>
            How It Works
          </div>
          <h2 class="section-title">Up and running in <span class="gradient-text">3 steps</span></h2>
          <div class="steps-row">
            <div class="step-card animate-fade-up" *ngFor="let s of howSteps; let i = index" [style.animation-delay]="(i * 0.1) + 's'">
              <div class="step-num">{{i+1}}</div>
              <mat-icon class="step-icon">{{s.icon}}</mat-icon>
              <h3>{{s.title}}</h3>
              <p>{{s.desc}}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CTA BANNER ─────────────────────────────── -->
      <section class="cta-section" *ngIf="!isLoggedIn">
        <div class="cta-inner">
          <div class="cta-blob"></div>
          <h2 class="cta-title">Ready to take control of your inventory?</h2>
          <p class="cta-sub">Join thousands of businesses using PRP Stores today.</p>
          <a routerLink="/register" class="btn-hero-primary" id="cta-register-btn">
            <mat-icon>person_add</mat-icon>
            Create Free Account
          </a>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .home-wrap { width: 100%; }

    /* ── Hero ─────────────────────────────────────── */
    .hero {
      position: relative; overflow: hidden;
      padding: 80px 48px;
      min-height: 80vh;
      display: flex; align-items: center;
      border-bottom: 1px solid var(--border);
    }

    .hero-blobs { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
    .hblob {
      position: absolute; border-radius: 50%;
      filter: blur(100px); opacity: 0.12;
      animation: blobPulse 10s ease-in-out infinite;
    }
    .hblob-1 { width: 600px; height: 600px; background: var(--primary); top: -150px; right: -100px; animation-delay: 0s; }
    .hblob-2 { width: 400px; height: 400px; background: var(--secondary); bottom: -100px; left: -50px; animation-delay: 4s; }

    .hero-inner {
      position: relative; z-index: 1;
      max-width: 720px;
      animation: fadeInUp 0.6s ease both;
    }

    .hero-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px;
      background: rgba(108,99,255,0.12);
      border: 1px solid rgba(108,99,255,0.3);
      border-radius: 99px;
      font-size: 0.8rem; font-weight: 600; color: var(--primary);
      margin-bottom: 24px;
    }
    .hero-chip mat-icon { font-size: 16px; }

    .hero-title {
      font-size: clamp(2.4rem, 5vw, 3.8rem);
      font-weight: 800; line-height: 1.1;
      color: var(--text-primary);
      margin-bottom: 20px;
      letter-spacing: -0.03em;
    }

    .hero-desc {
      font-size: 1.1rem; color: var(--text-muted);
      line-height: 1.75; margin-bottom: 36px;
      max-width: 560px;
    }

    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }

    .btn-hero-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 24px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white; font-size: 0.95rem; font-weight: 600;
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 20px var(--primary-glow);
    }
    .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px var(--primary-glow); }
    .btn-hero-primary mat-icon { font-size: 18px; }

    .btn-hero-outline {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 24px;
      background: transparent;
      border: 1.5px solid var(--border);
      color: var(--text-secondary); font-size: 0.95rem; font-weight: 600;
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .btn-hero-outline:hover { border-color: var(--primary); color: var(--primary); }
    .btn-hero-outline mat-icon { font-size: 18px; }

    /* Stats */
    .stats-row {
      display: flex; gap: 40px; flex-wrap: wrap;
    }
    .stat-value { font-size: 2rem; font-weight: 800; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }

    /* ── Features ─────────────────────────────────── */
    .features-section {
      padding: 80px 48px;
      border-bottom: 1px solid var(--border);
    }

    .section-inner { max-width: 1200px; margin: 0 auto; }

    .section-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px;
      background: rgba(108,99,255,0.1);
      border: 1px solid rgba(108,99,255,0.25);
      border-radius: 99px;
      font-size: 0.8rem; font-weight: 600; color: var(--primary);
      margin-bottom: 16px;
    }
    .section-badge mat-icon { font-size: 16px; }

    .section-title {
      font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800;
      color: var(--text-primary); margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    .section-desc { font-size: 1rem; color: var(--text-muted); max-width: 500px; margin-bottom: 48px; }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .feature-card {
      padding: 28px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
      cursor: default;
    }
    .feature-card:hover {
      transform: translateY(-6px);
      border-color: var(--primary-light);
      box-shadow: 0 12px 40px rgba(108,99,255,0.2);
    }

    .fc-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .fc-icon mat-icon { font-size: 24px; }
    .fc-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
    .fc-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.65; }

    /* ── How It Works ─────────────────────────────── */
    .how-section {
      padding: 80px 48px;
      border-bottom: 1px solid var(--border);
    }

    .steps-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 32px;
      margin-top: 48px;
    }

    .step-card {
      padding: 28px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      text-align: center;
      transition: all var(--transition-base);
      animation: fadeInUp 0.5s ease both;
    }
    .step-card:hover { transform: translateY(-4px); border-color: var(--border-hover); }

    .step-num {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; color: white;
      margin: 0 auto 16px;
    }

    .step-icon { font-size: 40px; color: var(--primary); margin-bottom: 16px; display: block; }
    .step-card h3 { font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
    .step-card p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; }

    /* ── CTA ──────────────────────────────────────── */
    .cta-section {
      padding: 80px 48px;
      position: relative; overflow: hidden;
    }

    .cta-inner {
      max-width: 600px; margin: 0 auto;
      text-align: center;
      position: relative; z-index: 1;
    }

    .cta-blob {
      position: absolute; width: 500px; height: 500px;
      background: var(--primary);
      border-radius: 50%; filter: blur(120px); opacity: 0.08;
      top: 50%; left: 50%; transform: translate(-50%, -50%);
    }

    .cta-title { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: var(--text-primary); margin-bottom: 12px; }
    .cta-sub { font-size: 1rem; color: var(--text-muted); margin-bottom: 32px; }

    /* ── Responsive ───────────────────────────────── */
    @media (max-width: 768px) {
      .hero        { padding: 60px 24px; }
      .features-section,
      .how-section,
      .cta-section { padding: 60px 24px; }
      .stats-row   { gap: 24px; }
      .hero-actions { flex-direction: column; }
      .btn-hero-primary, .btn-hero-outline { justify-content: center; }
    }
  `]
})
export class HomeComponent {
  isLoggedIn = false;

  stats = [
    { v: '500+', l: 'Products' },
    { v: '50+', l: 'Categories' },
    { v: '10K+', l: 'Orders Shipped' },
  ];

  features = [
    { icon: 'inventory_2',   title: 'Smart Inventory',    desc: 'Real-time stock tracking with low-stock alerts and automated reorder suggestions.', bg: 'rgba(108,99,255,0.12)', color: '#6C63FF' },
    { icon: 'payments',      title: 'Secure Payments',    desc: 'Integrated UPI & Razorpay checkout for seamless, secure transactions.', bg: 'rgba(0,210,255,0.12)', color: '#00D2FF' },
    { icon: 'local_shipping',title: 'Fast Delivery',      desc: 'Quick order processing and reliable delivery tracking to your doorstep.', bg: 'rgba(6,214,160,0.12)', color: '#06D6A0' },
    { icon: 'support_agent', title: '24/7 AI Support',    desc: 'Round-the-clock support powered by our intelligent chatbot assistant.', bg: 'rgba(255,209,102,0.12)', color: '#FFD166' },
    { icon: 'verified',      title: 'Quality Assured',    desc: 'All products sourced from verified suppliers and quality-checked.', bg: 'rgba(239,71,111,0.12)', color: '#EF476F' },
    { icon: 'analytics',     title: 'Deep Analytics',     desc: 'Admin dashboard with insights on sales, users, inventory value, and trends.', bg: 'rgba(255,179,71,0.12)', color: '#FFB347' },
  ];

  howSteps = [
    { icon: 'person_add',   title: 'Create Account',    desc: 'Sign up in under a minute with just your email and password.' },
    { icon: 'search',       title: 'Browse Products',   desc: 'Explore our full catalogue, filter by category, and add items to cart.' },
    { icon: 'payment',      title: 'Checkout Instantly', desc: 'Pay securely via UPI and track your order in real time.' },
  ];

  constructor(private authService: AuthService) {
    this.isLoggedIn = this.authService.isLoggedIn;
  }
}
