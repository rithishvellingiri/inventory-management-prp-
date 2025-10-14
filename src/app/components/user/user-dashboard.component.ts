import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>My Dashboard</h1>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon color="primary">shopping_bag</mat-icon>
          <h3>{{orders.length}}</h3>
          <p>Total Orders</p>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon color="accent">currency_rupee</mat-icon>
          <h3>₹{{totalSpent | number:'1.0-0'}}</h3>
          <p>Total Spent</p>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon style="color: #4caf50;">feedback</mat-icon>
          <h3>{{feedback.length}}</h3>
          <p>My Feedback</p>
        </mat-card>
      </div>

      <mat-tab-group>
        <mat-tab label="My Orders">
          <div class="tab-content">
            <table mat-table [dataSource]="orders" class="data-table" *ngIf="orders.length > 0">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Order ID</th>
                <td mat-cell *matCellDef="let order">{{order.id.substring(0, 8)}}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let order">{{order.orderDate | date:'short'}}</td>
              </ng-container>
              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef>Items</th>
                <td mat-cell *matCellDef="let order">{{order.items.length}} items</td>
              </ng-container>
              <ng-container matColumnDef="products">
                <th mat-header-cell *matHeaderCellDef>Products Purchased</th>
                <td mat-cell *matCellDef="let order">
                  <span class="product-pill" *ngFor="let it of order.items; let last = last">
                    {{it.productName}}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let order">₹{{order.totalAmount | number:'1.2-2'}}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Payment</th>
                <td mat-cell *matCellDef="let order">
                  <span [class.status-success]="order.paymentStatus === 'success'"
                        [class.status-pending]="order.paymentStatus === 'pending'">
                    {{order.paymentStatus}}
                  </span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['id', 'date', 'items', 'products', 'amount', 'status']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['id', 'date', 'items', 'products', 'amount', 'status'];"></tr>
            </table>
            <div *ngIf="orders.length === 0" class="no-data">
              <mat-icon>shopping_bag</mat-icon>
              <p>No orders yet</p>
              <button mat-raised-button color="primary" routerLink="/products">Start Shopping</button>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Feedback & Enquiry">
          <div class="tab-content">
            <mat-card class="feedback-form">
              <h3>Submit Feedback or Enquiry</h3>
              <form #feedbackForm="ngForm" (ngSubmit)="submitFeedback()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Type</mat-label>
                  <mat-select [(ngModel)]="newFeedback.type" name="type" required>
                    <mat-option value="feedback">Feedback</mat-option>
                    <mat-option value="enquiry">Enquiry</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Product (Optional)</mat-label>
                  <mat-select [(ngModel)]="newFeedback.productId" name="product">
                    <mat-option value="">None</mat-option>
                    <mat-option *ngFor="let product of products" [value]="product.id">
                      {{product.name}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Message</mat-label>
                  <textarea matInput [(ngModel)]="newFeedback.message" name="message" required rows="4"></textarea>
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" [disabled]="!feedbackForm.valid">
                  Submit
                </button>
              </form>
            </mat-card>

            <h3>My Feedback History</h3>
            <mat-card *ngFor="let fb of feedback" class="feedback-item">
              <div class="feedback-header">
                <span class="feedback-type">{{fb.type}}</span>
                <span class="feedback-date">{{fb.createdAt | date:'short'}}</span>
              </div>
              <p *ngIf="fb.productName"><strong>Product:</strong> {{fb.productName}}</p>
              <p><strong>Message:</strong> {{fb.message}}</p>
              <div *ngIf="fb.chatbotReply" class="chatbot-reply">
                <mat-icon>smart_toy</mat-icon>
                <p>{{fb.chatbotReply}}</p>
              </div>
            </mat-card>
            <div *ngIf="feedback.length === 0" class="no-data">
              <mat-icon>feedback</mat-icon>
              <p>No feedback submitted yet</p>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="My Activity">
          <div class="tab-content">
            <table mat-table [dataSource]="history" class="data-table" *ngIf="history.length > 0">
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let h">{{h.actionType}}</td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let h">{{h.description}}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let h">{{h.createdAt | date:'short'}}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['action', 'description', 'date']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['action', 'description', 'date'];"></tr>
            </table>
            <div *ngIf="history.length === 0" class="no-data">
              <mat-icon>history</mat-icon>
              <p>No activity yet</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 2rem;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      text-align: center;
      padding: 1.5rem;
    }

    .stat-card mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }

    .stat-card h3 {
      font-size: 2rem;
      margin: 0.5rem 0;
      color: #333;
    }

    .stat-card p {
      margin: 0;
      color: #666;
    }

    .tab-content {
      padding: 2rem;
    }

    .data-table {
      width: 100%;
      margin-top: 1rem;
    }

    .status-success {
      color: #4caf50;
      font-weight: 600;
    }

    .status-pending {
      color: #ff9800;
      font-weight: 600;
    }

    .product-pill {
      display: inline-block;
      margin: 0 6px 6px 0;
      padding: 4px 8px;
      background: #f0f7ff;
      border: 1px solid #d6e6ff;
      border-radius: 12px;
      font-size: 0.85rem;
      color: #333;
    }

    .no-data {
      text-align: center;
      padding: 4rem 2rem;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
    }

    .feedback-form {
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .feedback-form h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .feedback-item {
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .feedback-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .feedback-type {
      background-color: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .feedback-date {
      color: #999;
      font-size: 0.9rem;
    }

    .feedback-item p {
      margin: 0.5rem 0;
      color: #555;
    }

    .chatbot-reply {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f0f7ff;
      border-left: 4px solid #667eea;
      display: flex;
      gap: 1rem;
    }

    .chatbot-reply mat-icon {
      color: #667eea;
    }

    .chatbot-reply p {
      margin: 0;
    }

    /* Dark theme only affects background, keeping text in light theme */
    /* :host ::ng-deep .dark-theme h1,
    :host ::ng-deep .dark-theme .stat-card h3,
    :host ::ng-deep .dark-theme .feedback-form h3 {
      color: #e0e0e0;
    }

    :host ::ng-deep .dark-theme .stat-card p,
    :host ::ng-deep .dark-theme .feedback-item p {
      color: #b0b0b0;
    }

    :host ::ng-deep .dark-theme .chatbot-reply {
      background-color: #2c2c2c;
    } */

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .data-table {
        font-size: 0.85rem;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  orders: Order[] = [];
  feedback: Feedback[] = [];
  history: History[] = [];
  products: Product[] = [];
  totalSpent = 0;
  newFeedback = {
    type: 'enquiry',
    productId: '',
    message: ''
  };

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    // Load products from backend to ensure valid MongoDB productIds
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.products = [];
      }
    });
    // Load orders from backend
    this.apiService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders as any; // shape from backend
        this.totalSpent = this.orders.reduce((sum, o: any) => sum + o.totalAmount, 0);
      },
      error: () => { }
    });

    // Load feedback from backend
    this.apiService.getFeedback().subscribe({
      next: (feedback) => {
        // Map to local Feedback model minimally for display
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
      error: () => { }
    });

    const allHistory = this.storageService.getHistory();
    this.history = allHistory.filter(h => h.userId === user.id);
  }

  submitFeedback(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    // Submit to backend
    const payload: any = {
      message: this.newFeedback.message,
      type: this.newFeedback.type
    };
    if (this.newFeedback.productId) {
      payload.productId = this.newFeedback.productId;
    }

    this.apiService.createFeedback(payload).subscribe({
      next: () => {
        this.snackBar.open('Feedback submitted successfully!', 'Close', { duration: 3000 });
        this.newFeedback = { type: 'enquiry', productId: '', message: '' };
        this.loadData();
      },
      error: (err) => {
        console.error('Feedback submission failed', err);
        const msg = err?.error?.message || 'Failed to submit feedback';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
