import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';
import { Feedback } from '../../models/feedback.model';
import { History } from '../../models/history.model';
import { Product } from '../../models/product.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-page animate-fade-up">

      <!-- ── Header ─────────────────────────────── -->
      <div class="page-header">
        <div class="header-left">
          <div class="user-greeting">
            <div class="greeting-avatar">{{getUserInitial()}}</div>
            <div>
              <h1 class="page-title">Welcome back, {{getUserFirstName()}}!</h1>
              <p class="page-sub">Here's a summary of your account activity</p>
            </div>
          </div>
        </div>
        <a routerLink="/products" class="shop-now-btn" id="shop-now-btn">
          <mat-icon>inventory_2</mat-icon>
          Shop Now
        </a>
      </div>

      <!-- ── Stat Cards ──────────────────────────── -->
      <div class="stats-grid">
        <div class="stat-card animate-scale-in">
          <div class="sc-icon" style="background:rgba(108,99,255,0.12)">
            <mat-icon style="color:#6C63FF">shopping_bag</mat-icon>
          </div>
          <div>
            <div class="sc-val">{{orders.length}}</div>
            <div class="sc-lbl">Total Orders</div>
          </div>
        </div>
        <div class="stat-card animate-scale-in" style="animation-delay:0.1s">
          <div class="sc-icon" style="background:rgba(6,214,160,0.12)">
            <mat-icon style="color:#06D6A0">currency_rupee</mat-icon>
          </div>
          <div>
            <div class="sc-val">₹{{totalSpent | number:'1.0-0'}}</div>
            <div class="sc-lbl">Total Spent</div>
          </div>
        </div>
        <div class="stat-card animate-scale-in" style="animation-delay:0.2s">
          <div class="sc-icon" style="background:rgba(0,210,255,0.12)">
            <mat-icon style="color:#00D2FF">feedback</mat-icon>
          </div>
          <div>
            <div class="sc-val">{{feedback.length}}</div>
            <div class="sc-lbl">Feedback Sent</div>
          </div>
        </div>
        <div class="stat-card animate-scale-in" style="animation-delay:0.3s">
          <div class="sc-icon" style="background:rgba(255,209,102,0.12)">
            <mat-icon style="color:#FFD166">history</mat-icon>
          </div>
          <div>
            <div class="sc-val">{{history.length}}</div>
            <div class="sc-lbl">Activities</div>
          </div>
        </div>
      </div>

      <!-- ── Tabs ───────────────────────────────── -->
      <div class="tabs-wrapper">
        <mat-tab-group animationDuration="200ms">

          <!-- My Orders -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">shopping_bag</mat-icon>
              My Orders
            </ng-template>
            <div class="tab-content">

              <!-- Orders table -->
              <div class="table-wrap" *ngIf="orders.length > 0">
                <table mat-table [dataSource]="orders" class="data-table">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef>Order ID</th>
                    <td mat-cell *matCellDef="let o" class="mono-cell">#{{o.id.substring(0,8)}}</td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let o" class="muted-cell">{{o.orderDate | date:'mediumDate'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="products">
                    <th mat-header-cell *matHeaderCellDef>Products</th>
                    <td mat-cell *matCellDef="let o">
                      <span class="product-pill" *ngFor="let it of o.items">{{it.productName}}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount</th>
                    <td mat-cell *matCellDef="let o" class="price-cell">₹{{o.totalAmount | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let o">
                      <span class="status-badge" [ngClass]="o.paymentStatus === 'success' ? 'success' : 'pending'">
                        <span class="status-dot"></span>
                        {{o.paymentStatus}}
                      </span>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['id','date','products','amount','status']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['id','date','products','amount','status'];"></tr>
                </table>
              </div>

              <!-- Empty state -->
              <div class="empty-state" *ngIf="orders.length === 0">
                <div class="empty-icon"><mat-icon>shopping_bag</mat-icon></div>
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here.</p>
                <a routerLink="/products" class="empty-cta" id="orders-shop-btn">Browse Products</a>
              </div>
            </div>
          </mat-tab>

          <!-- Feedback & Enquiry -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">feedback</mat-icon>
              Feedback
            </ng-template>
            <div class="tab-content">

              <!-- Submit Form -->
              <div class="feedback-form-card">
                <h3 class="form-title">Submit Feedback or Enquiry</h3>
                <form #feedbackForm="ngForm" (ngSubmit)="submitFeedback()" class="fb-form">

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Type</label>
                      <select class="form-select" [(ngModel)]="newFeedback.type" name="type" required id="fb-type">
                        <option value="feedback">Feedback</option>
                        <option value="enquiry">Enquiry</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Product (Optional)</label>
                      <select class="form-select" [(ngModel)]="newFeedback.productId" name="product" id="fb-product">
                        <option value="">None</option>
                        <option *ngFor="let p of products" [value]="p.id">{{p.name}}</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Message</label>
                    <textarea
                      class="form-textarea"
                      [(ngModel)]="newFeedback.message"
                      name="message"
                      required
                      rows="4"
                      placeholder="Write your message here…"
                      id="fb-message"></textarea>
                  </div>

                  <button type="submit" class="submit-btn" [disabled]="!feedbackForm.valid || isSubmitting" id="fb-submit">
                    <span class="btn-spinner" *ngIf="isSubmitting"></span>
                    <mat-icon *ngIf="!isSubmitting">send</mat-icon>
                    <span>{{isSubmitting ? 'Submitting…' : 'Submit'}}</span>
                  </button>
                </form>
              </div>

              <!-- History -->
              <h3 class="section-heading" *ngIf="feedback.length > 0">My Feedback History</h3>

              <div class="feedback-list">
                <div class="feedback-item animate-fade-up" *ngFor="let fb of feedback">
                  <div class="fb-header">
                    <span class="fb-type-badge">{{fb.type}}</span>
                    <span class="fb-date">{{fb.createdAt | date:'mediumDate'}}</span>
                  </div>
                  <p class="fb-product" *ngIf="fb.productName">
                    <mat-icon>inventory_2</mat-icon>
                    {{fb.productName}}
                  </p>
                  <p class="fb-message">{{fb.message}}</p>
                  <div class="fb-bot-reply" *ngIf="fb.chatbotReply">
                    <mat-icon>smart_toy</mat-icon>
                    <p>{{fb.chatbotReply}}</p>
                  </div>
                </div>
              </div>

              <div class="empty-state" *ngIf="feedback.length === 0">
                <div class="empty-icon"><mat-icon>feedback</mat-icon></div>
                <h3>No feedback yet</h3>
                <p>Use the form above to submit your first feedback.</p>
              </div>
            </div>
          </mat-tab>

          <!-- Activity -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">history</mat-icon>
              Activity
            </ng-template>
            <div class="tab-content">
              <div class="activity-list" *ngIf="history.length > 0">
                <div class="activity-item" *ngFor="let h of history">
                  <div class="act-line"></div>
                  <div class="act-dot"></div>
                  <div class="act-body">
                    <div class="act-row">
                      <span class="act-type">{{h.actionType}}</span>
                      <span class="act-date">{{h.createdAt | date:'short'}}</span>
                    </div>
                    <p class="act-desc">{{h.description}}</p>
                  </div>
                </div>
              </div>
              <div class="empty-state" *ngIf="history.length === 0">
                <div class="empty-icon"><mat-icon>history</mat-icon></div>
                <h3>No activity yet</h3>
                <p>Your actions will appear here.</p>
              </div>
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 32px;
      max-width: 1300px;
      margin: 0 auto;
    }
    @media (max-width: 768px) { .dashboard-page { padding: 16px; } }

    /* Header */
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
    .header-left {}
    .user-greeting { display: flex; align-items: center; gap: 16px; }

    .greeting-avatar {
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 800; color: white;
      flex-shrink: 0;
      box-shadow: 0 4px 16px var(--primary-glow);
    }

    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .page-sub   { font-size: 0.875rem; color: var(--text-muted); margin-top: 4px; }

    .shop-now-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 20px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white; font-size: 0.875rem; font-weight: 600;
      border-radius: var(--radius-sm); text-decoration: none;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 16px var(--primary-glow);
    }
    .shop-now-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px var(--primary-glow); }
    .shop-now-btn mat-icon { font-size: 18px; }

    /* ── Stats ───────────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex; align-items: center; gap: 16px;
      transition: all var(--transition-base);
    }
    .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

    .sc-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sc-icon mat-icon { font-size: 24px; }
    .sc-val { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .sc-lbl { font-size: 0.75rem; color: var(--text-muted); margin-top: 5px; }

    /* ── Tabs ────────────────────────────────────── */
    .tabs-wrapper {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .tab-icon { margin-right: 6px; font-size: 18px; }
    .tab-content { padding: 24px; }

    /* ── Table ───────────────────────────────────── */
    .table-wrap { overflow-x: auto; border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 24px; }
    .data-table { width: 100%; }

    .mono-cell  { font-family: monospace; font-size: 0.85rem; color: var(--text-muted); }
    .muted-cell { color: var(--text-muted); font-size: 0.85rem; }
    .price-cell { font-weight: 700; color: var(--primary-light); }

    .product-pill {
      display: inline-block; margin: 2px 4px 2px 0;
      padding: 3px 10px;
      background: rgba(108,99,255,0.1); color: var(--primary);
      border: 1px solid rgba(108,99,255,0.2);
      border-radius: 99px; font-size: 0.72rem; font-weight: 600;
    }

    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 99px;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    }
    .status-badge.success { background: rgba(6,214,160,0.12); color: var(--success); }
    .status-badge.pending { background: rgba(255,209,102,0.12); color: var(--accent); }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    /* ── Feedback Form ───────────────────────────── */
    .feedback-form-card {
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 24px;
      margin-bottom: 28px;
    }
    .form-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; }

    .fb-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { font-size: 0.825rem; font-weight: 600; color: var(--text-secondary); }

    .form-select, .form-textarea {
      background: var(--bg-surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--text-primary); font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color var(--transition-fast);
      width: 100%;
    }
    .form-select:focus, .form-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
    .form-textarea { resize: vertical; min-height: 100px; }

    .submit-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 11px 24px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border: none; border-radius: var(--radius-sm);
      color: white; font-size: 0.9rem; font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer; align-self: flex-start;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 16px var(--primary-glow);
    }
    .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px var(--primary-glow); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .submit-btn mat-icon { font-size: 18px; }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* Feedback Items */
    .section-heading { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }

    .feedback-list { display: flex; flex-direction: column; gap: 12px; }

    .feedback-item {
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px;
      transition: border-color var(--transition-fast);
    }
    .feedback-item:hover { border-color: var(--border-hover); }

    .fb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .fb-type-badge {
      padding: 3px 10px;
      background: rgba(108,99,255,0.12); color: var(--primary);
      border: 1px solid rgba(108,99,255,0.25);
      border-radius: 99px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    }
    .fb-date { font-size: 0.78rem; color: var(--text-muted); }

    .fb-product {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;
    }
    .fb-product mat-icon { font-size: 14px; }

    .fb-message { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

    .fb-bot-reply {
      display: flex; align-items: flex-start; gap: 10px;
      margin-top: 12px; padding: 12px;
      background: rgba(0,210,255,0.06);
      border: 1px solid rgba(0,210,255,0.2);
      border-radius: var(--radius-sm);
    }
    .fb-bot-reply mat-icon { color: var(--secondary); font-size: 18px; flex-shrink: 0; margin-top: 2px; }
    .fb-bot-reply p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin: 0; }

    /* ── Activity Timeline ───────────────────────── */
    .activity-list { display: flex; flex-direction: column; gap: 0; }

    .activity-item {
      display: flex; align-items: flex-start; gap: 0;
      position: relative; padding-left: 28px; padding-bottom: 20px;
    }

    .act-line {
      position: absolute; left: 9px; top: 20px; bottom: 0;
      width: 2px; background: var(--border);
    }
    .activity-item:last-child .act-line { display: none; }

    .act-dot {
      position: absolute; left: 4px; top: 6px;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: var(--primary);
      border: 2px solid var(--bg-surface);
      box-shadow: 0 0 0 2px rgba(108,99,255,0.3);
    }

    .act-body { flex: 1; }

    .act-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .act-type { font-size: 0.8rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; }
    .act-date { font-size: 0.75rem; color: var(--text-muted); }
    .act-desc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; }

    /* ── Empty State ─────────────────────────────── */
    .empty-state { text-align: center; padding: 60px 24px; }
    .empty-icon {
      width: 72px; height: 72px;
      background: rgba(108,99,255,0.1); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
    }
    .empty-icon mat-icon { font-size: 32px; color: var(--primary); }
    .empty-state h3 { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
    .empty-state p  { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 20px; }

    .empty-cta {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 20px;
      background: rgba(108,99,255,0.15);
      border: 1px solid rgba(108,99,255,0.3);
      border-radius: var(--radius-sm);
      color: var(--primary); font-weight: 600; font-size: 0.875rem;
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .empty-cta:hover { background: rgba(108,99,255,0.25); }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  orders: Order[] = [];
  feedback: Feedback[] = [];
  history: History[] = [];
  products: Product[] = [];
  totalSpent = 0;
  isSubmitting = false;
  newFeedback = { type: 'enquiry', productId: '', message: '' };

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private apiService: ApiService
  ) {}

  ngOnInit(): void { this.loadData(); }

  getUserInitial(): string {
    return this.authService.currentUserValue?.fullName?.charAt(0)?.toUpperCase() || 'U';
  }

  getUserFirstName(): string {
    return this.authService.currentUserValue?.fullName?.split(' ')[0] || 'User';
  }

  loadData(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    this.apiService.getProducts().subscribe({
      next: (products) => { this.products = products; },
      error: () => { this.products = []; }
    });

    this.apiService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders as any;
        this.totalSpent = this.orders.reduce((sum, o: any) => sum + o.totalAmount, 0);
      },
      error: () => {}
    });

    this.apiService.getFeedback().subscribe({
      next: (feedback) => {
        this.feedback = (feedback as any[]).map(f => ({
          id: f._id || f.id,
          userId: f.userId?._id || f.userId,
          userName: f.userId?.fullName,
          productId: f.productId?._id || f.productId,
          productName: f.productId?.name,
          message: f.message,
          type: f.type,
          chatbotReply: f.chatbotReply,
          createdAt: f.createdAt
        }));
      },
      error: () => {}
    });

    this.apiService.getHistory().subscribe({
      next: (history: any[]) => { this.history = history; },
      error: () => {}
    });
  }

  submitFeedback(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    this.isSubmitting = true;
    const payload: any = { message: this.newFeedback.message, type: this.newFeedback.type };
    if (this.newFeedback.productId) payload.productId = this.newFeedback.productId;

    this.apiService.createFeedback(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('✓ Feedback submitted successfully!', 'Close', { duration: 3000 });
        this.newFeedback = { type: 'enquiry', productId: '', message: '' };
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Feedback submission failed', err);
        const msg = err?.error?.message || 'Failed to submit feedback';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
