import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';
import { Feedback } from '../../models/feedback.model';
import { History } from '../../models/history.model';
import { ProductFormComponent } from './product-form.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-page animate-fade-up">

      <!-- ── Header ─────────────────────────────── -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Admin Dashboard</h1>
          <p class="page-sub">Overview of your inventory and operations</p>
        </div>
        <div class="header-badge">
          <mat-icon>admin_panel_settings</mat-icon>
          Administrator
        </div>
      </div>

      <!-- ── Stat Cards ──────────────────────────── -->
      <div class="stats-grid stagger-children">

        <div class="stat-card animate-scale-in" *ngFor="let card of statCards" [style.--accent-color]="card.color" [style.--accent-bg]="card.bg">
          <div class="sc-icon-wrap">
            <mat-icon>{{card.icon}}</mat-icon>
          </div>
          <div class="sc-body">
            <div class="sc-value">{{card.value}}</div>
            <div class="sc-label">{{card.label}}</div>
          </div>
          <div class="sc-decor"></div>
        </div>

      </div>

      <!-- ── Low Stock Alert ─────────────────────── -->
      <div class="alert-banner" *ngIf="lowStockProducts.length > 0">
        <div class="alert-inner">
          <div class="alert-icon">
            <mat-icon>warning_amber</mat-icon>
          </div>
          <div class="alert-body">
            <div class="alert-title">Low Stock Alert — {{lowStockProducts.length}} products need attention</div>
            <div class="alert-items">
              <span class="alert-item" *ngFor="let p of lowStockProducts">
                {{p.name}} ({{p.stock}} left)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Tabs ───────────────────────────────── -->
      <div class="tabs-wrapper">
        <mat-tab-group animationDuration="200ms">

          <!-- Products Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">inventory_2</mat-icon>
              Products
            </ng-template>
            <div class="tab-content">
              <div class="tab-toolbar">
                <h3 class="tab-heading">Product Catalogue</h3>
                <button class="add-btn" (click)="openProductForm()" id="add-product-btn">
                  <mat-icon>add</mat-icon>
                  Add Product
                </button>
              </div>
              <div class="table-wrap">
                <table mat-table [dataSource]="products" class="data-table">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let p">
                      <div class="product-cell">
                        <div class="product-dot" [style.background]="getProductColor(p.categoryName)"></div>
                        <span>{{p.name}}</span>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="category">
                    <th mat-header-cell *matHeaderCellDef>Category</th>
                    <td mat-cell *matCellDef="let p">
                      <span class="cat-tag">{{p.categoryName}}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="price">
                    <th mat-header-cell *matHeaderCellDef>Price</th>
                    <td mat-cell *matCellDef="let p" class="price-cell">₹{{p.price | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="stock">
                    <th mat-header-cell *matHeaderCellDef>Stock</th>
                    <td mat-cell *matCellDef="let p">
                      <span class="stock-chip" [ngClass]="p.stock === 0 ? 'out' : p.stock <= 10 ? 'low' : 'ok'">
                        {{p.stock}}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let p">
                      <div class="row-actions">
                        <button class="action-btn edit" (click)="openProductForm(p)"><mat-icon>edit</mat-icon></button>
                        <button class="action-btn del" (click)="deleteProduct(p)"><mat-icon>delete</mat-icon></button>
                      </div>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['name','category','price','stock','actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['name','category','price','stock','actions'];"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Categories Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">category</mat-icon>
              Categories
            </ng-template>
            <div class="tab-content">
              <div class="tab-toolbar">
                <h3 class="tab-heading">Categories</h3>
                <button class="add-btn" (click)="addCategory()" id="add-category-btn">
                  <mat-icon>add</mat-icon>
                  Add Category
                </button>
              </div>
              <div class="table-wrap">
                <table mat-table [dataSource]="categories" class="data-table">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let c"><span class="cat-tag">{{c.name}}</span></td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let c" class="muted-cell">{{c.description || '—'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let c">
                      <div class="row-actions">
                        <button class="action-btn edit" (click)="editCategory(c)"><mat-icon>edit</mat-icon></button>
                        <button class="action-btn del" (click)="deleteCategory(c)"><mat-icon>delete</mat-icon></button>
                      </div>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['name','description','actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['name','description','actions'];"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Suppliers Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">local_shipping</mat-icon>
              Suppliers
            </ng-template>
            <div class="tab-content">
              <div class="tab-toolbar">
                <h3 class="tab-heading">Suppliers</h3>
                <button class="add-btn" (click)="addSupplier()" id="add-supplier-btn">
                  <mat-icon>add</mat-icon>
                  Add Supplier
                </button>
              </div>
              <div class="table-wrap">
                <table mat-table [dataSource]="suppliers" class="data-table">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let s" class="bold-cell">{{s.name}}</td>
                  </ng-container>
                  <ng-container matColumnDef="contact">
                    <th mat-header-cell *matHeaderCellDef>Contact</th>
                    <td mat-cell *matCellDef="let s" class="muted-cell">{{s.contact || '—'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let s" class="muted-cell">{{s.email || '—'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="address">
                    <th mat-header-cell *matHeaderCellDef>Address</th>
                    <td mat-cell *matCellDef="let s" class="muted-cell">{{s.address || '—'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let s">
                      <div class="row-actions">
                        <button class="action-btn edit" (click)="editSupplier(s)"><mat-icon>edit</mat-icon></button>
                        <button class="action-btn del" (click)="deleteSupplier(s)"><mat-icon>delete</mat-icon></button>
                      </div>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['name','contact','email','address','actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['name','contact','email','address','actions'];"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Orders Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">shopping_bag</mat-icon>
              Orders
            </ng-template>
            <div class="tab-content">
              <div class="tab-toolbar">
                <h3 class="tab-heading">All Orders</h3>
              </div>
              <div class="table-wrap">
                <table mat-table [dataSource]="orders" class="data-table">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef>Order ID</th>
                    <td mat-cell *matCellDef="let o" class="mono-cell">#{{o.id.substring(0, 8)}}</td>
                  </ng-container>
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef>Customer</th>
                    <td mat-cell *matCellDef="let o" class="bold-cell">{{o.userId?.fullName || o.userName || 'Guest'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount</th>
                    <td mat-cell *matCellDef="let o" class="price-cell">₹{{o.totalAmount | number:'1.2-2'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let o">
                      <span class="status-badge" [ngClass]="o.paymentStatus === 'success' ? 'success' : 'pending'">
                        {{o.paymentStatus}}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let o" class="muted-cell">{{o.orderDate | date:'mediumDate'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['id','user','amount','status','date']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['id','user','amount','status','date'];"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Feedback Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">feedback</mat-icon>
              Feedback
            </ng-template>
            <div class="tab-content">
              <div class="tab-toolbar"><h3 class="tab-heading">Customer Feedback</h3></div>
              <div class="table-wrap">
                <table mat-table [dataSource]="feedback" class="data-table">
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef>User</th>
                    <td mat-cell *matCellDef="let fb" class="bold-cell">{{fb.userId?.fullName || fb.userName || 'Guest'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let fb">
                      <span class="type-badge">{{fb.type}}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="message">
                    <th mat-header-cell *matHeaderCellDef>Message</th>
                    <td mat-cell *matCellDef="let fb" class="muted-cell">{{fb.message | slice:0:80}}{{fb.message?.length > 80 ? '…' : ''}}</td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let fb" class="muted-cell">{{fb.createdAt | date:'mediumDate'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['user','type','message','date']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['user','type','message','date'];"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- History Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">history</mat-icon>
              History
            </ng-template>
            <div class="tab-content">
              <div class="tab-toolbar"><h3 class="tab-heading">Activity Log</h3></div>
              <div class="table-wrap">
                <table mat-table [dataSource]="history" class="data-table">
                  <ng-container matColumnDef="action">
                    <th mat-header-cell *matHeaderCellDef>Action</th>
                    <td mat-cell *matCellDef="let h">
                      <span class="action-chip">{{h.actionType}}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let h" class="muted-cell">{{h.description}}</td>
                  </ng-container>
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef>User</th>
                    <td mat-cell *matCellDef="let h" class="bold-cell">{{h.userId?.fullName || h.userName || 'System'}}</td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let h" class="muted-cell">{{h.createdAt | date:'medium'}}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['action','description','user','date']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['action','description','user','date'];"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>

    </div>
  `,
  styles: [`
    .admin-page {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
    }
    @media (max-width: 768px) { .admin-page { padding: 16px; } }

    /* Header */
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
    .page-title  { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
    .page-sub    { font-size: 0.875rem; color: var(--text-muted); margin-top: 4px; }
    .header-badge {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px;
      background: rgba(108,99,255,0.12);
      border: 1px solid rgba(108,99,255,0.3);
      border-radius: 99px;
      font-size: 0.8rem; font-weight: 600; color: var(--primary);
    }
    .header-badge mat-icon { font-size: 16px; }

    /* ── Stat Cards ─────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex; align-items: center; gap: 16px;
      position: relative; overflow: hidden;
      transition: all var(--transition-base);
    }
    .stat-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-color, var(--primary));
      box-shadow: 0 8px 32px rgba(108,99,255,0.15);
    }

    .sc-icon-wrap {
      width: 48px; height: 48px;
      border-radius: var(--radius-sm);
      background: var(--accent-bg, rgba(108,99,255,0.12));
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sc-icon-wrap mat-icon { color: var(--accent-color, var(--primary)); font-size: 24px; }

    .sc-value { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .sc-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 5px; }

    .sc-decor {
      position: absolute; right: -20px; bottom: -20px;
      width: 80px; height: 80px;
      border-radius: 50%;
      background: var(--accent-bg, rgba(108,99,255,0.06));
    }

    /* ── Low Stock Alert ────────────────────────── */
    .alert-banner {
      background: rgba(255,179,71,0.08);
      border: 1px solid rgba(255,179,71,0.3);
      border-left: 4px solid var(--warning);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      margin-bottom: 24px;
      animation: fadeInUp 0.4s ease;
    }
    .alert-inner { display: flex; align-items: flex-start; gap: 14px; }
    .alert-icon {
      width: 36px; height: 36px;
      background: rgba(255,179,71,0.15);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .alert-icon mat-icon { color: var(--warning); }
    .alert-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
    .alert-items { display: flex; gap: 8px; flex-wrap: wrap; }
    .alert-item {
      padding: 3px 10px;
      background: rgba(255,179,71,0.1);
      border: 1px solid rgba(255,179,71,0.3);
      border-radius: 99px;
      font-size: 0.75rem; font-weight: 600; color: var(--warning);
    }

    /* ── Tabs ────────────────────────────────────── */
    .tabs-wrapper {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .tab-icon { margin-right: 6px; font-size: 18px; }

    .tab-content { padding: 24px; }

    .tab-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
    }
    .tab-heading { font-size: 1rem; font-weight: 700; color: var(--text-primary); }

    .add-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 18px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border: none; border-radius: var(--radius-sm);
      color: white; font-size: 0.85rem; font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--primary-glow); }
    .add-btn mat-icon { font-size: 18px; }

    /* ── Table ───────────────────────────────────── */
    .table-wrap { overflow-x: auto; border-radius: var(--radius-sm); border: 1px solid var(--border); }
    .data-table { width: 100%; }

    /* Custom cell styles */
    .product-cell { display: flex; align-items: center; gap: 10px; }
    .product-dot  { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .bold-cell    { font-weight: 600; color: var(--text-primary); }
    .muted-cell   { color: var(--text-muted); font-size: 0.85rem; }
    .price-cell   { font-weight: 700; color: var(--primary-light); }
    .mono-cell    { font-family: monospace; font-size: 0.85rem; color: var(--text-muted); }

    /* Category tag */
    .cat-tag {
      display: inline-block; padding: 3px 10px;
      background: rgba(108,99,255,0.1); color: var(--primary);
      border: 1px solid rgba(108,99,255,0.2);
      border-radius: 99px; font-size: 0.75rem; font-weight: 600;
    }

    /* Stock chip */
    .stock-chip {
      display: inline-block; padding: 3px 10px;
      border-radius: 99px; font-size: 0.75rem; font-weight: 700;
    }
    .stock-chip.ok  { background: rgba(6,214,160,0.15); color: var(--success); }
    .stock-chip.low { background: rgba(255,209,102,0.15); color: var(--accent); }
    .stock-chip.out { background: rgba(239,71,111,0.15); color: var(--danger); }

    /* Status badge */
    .status-badge {
      display: inline-block; padding: 3px 10px;
      border-radius: 99px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    }
    .status-badge.success { background: rgba(6,214,160,0.15); color: var(--success); }
    .status-badge.pending { background: rgba(255,209,102,0.15); color: var(--accent); }

    /* Type badge */
    .type-badge {
      display: inline-block; padding: 3px 10px;
      background: rgba(0,210,255,0.1); color: var(--secondary);
      border: 1px solid rgba(0,210,255,0.2);
      border-radius: 99px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
    }

    /* Action chip */
    .action-chip {
      display: inline-block; padding: 3px 10px;
      background: var(--bg-surface-2); color: var(--text-muted);
      border-radius: 99px; font-size: 0.72rem; font-weight: 600;
    }

    /* Row Actions */
    .row-actions { display: flex; gap: 6px; align-items: center; }
    .action-btn {
      width: 30px; height: 30px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all var(--transition-fast);
      color: var(--text-muted);
    }
    .action-btn mat-icon { font-size: 16px; }
    .action-btn.edit:hover { border-color: var(--primary); color: var(--primary); background: rgba(108,99,255,0.1); }
    .action-btn.del:hover  { border-color: var(--danger);  color: var(--danger);  background: rgba(239,71,111,0.1); }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalProducts = 0;
  totalCategories = 0;
  totalSuppliers = 0;
  totalOrders = 0;
  totalUsers = 0;
  inventoryValue = 0;
  lowStockProducts: Product[] = [];
  products: Product[] = [];
  categories: any[] = [];
  suppliers: any[] = [];
  orders: Order[] = [];
  feedback: Feedback[] = [];
  history: History[] = [];

  get statCards() {
    return [
      { icon: 'inventory_2',    label: 'Total Products', value: this.totalProducts,   color: '#6C63FF', bg: 'rgba(108,99,255,0.12)' },
      { icon: 'category',       label: 'Categories',     value: this.totalCategories, color: '#00D2FF', bg: 'rgba(0,210,255,0.12)' },
      { icon: 'local_shipping', label: 'Suppliers',      value: this.totalSuppliers,  color: '#06D6A0', bg: 'rgba(6,214,160,0.12)' },
      { icon: 'shopping_bag',   label: 'Total Orders',   value: this.totalOrders,     color: '#FFD166', bg: 'rgba(255,209,102,0.12)' },
      { icon: 'people',         label: 'Users',          value: this.totalUsers,      color: '#FFB347', bg: 'rgba(255,179,71,0.12)' },
      { icon: 'currency_rupee', label: 'Inventory Value', value: '₹' + this.inventoryValue.toLocaleString('en-IN', {maximumFractionDigits:0}), color: '#9C59FF', bg: 'rgba(156,89,255,0.12)' },
    ];
  }

  private categoryColors: string[] = ['#6C63FF','#00D2FF','#06D6A0','#FFD166','#EF476F','#FFB347'];
  private colorMap: Record<string, string> = {};

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  getProductColor(categoryName: string): string {
    if (!this.colorMap[categoryName]) {
      const keys = Object.keys(this.colorMap);
      this.colorMap[categoryName] = this.categoryColors[keys.length % this.categoryColors.length];
    }
    return this.colorMap[categoryName];
  }

  loadData(): void {
    this.loadProducts(); this.loadCategories(); this.loadSuppliers();
    this.loadOrders(); this.loadFeedback(); this.loadHistory(); this.loadUsers();
  }

  loadUsers(): void {
    this.apiService.getUserStats().subscribe({
      next: (stats) => { this.totalUsers = stats.totalUsers || 0; },
      error: (error) => { console.error('Error loading users stats:', error); }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.totalProducts = products.length;
        this.inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        this.lowStockProducts = products.filter(p => p.stock < 10);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
      }
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (categories) => { this.categories = categories; this.totalCategories = categories.length; },
      error: (error) => { console.error('Error loading categories:', error); this.snackBar.open('Error loading categories', 'Close', { duration: 3000 }); }
    });
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe({
      next: (suppliers) => { this.suppliers = suppliers; this.totalSuppliers = suppliers.length; },
      error: (error) => { console.error('Error loading suppliers:', error); this.snackBar.open('Error loading suppliers', 'Close', { duration: 3000 }); }
    });
  }

  loadOrders(): void {
    this.apiService.getOrders().subscribe({
      next: (orders) => { this.orders = orders; this.totalOrders = orders.length; },
      error: (error) => { console.error('Error loading orders:', error); this.snackBar.open('Error loading orders', 'Close', { duration: 3000 }); }
    });
  }

  loadFeedback(): void {
    this.apiService.getFeedback().subscribe({
      next: (feedback) => { this.feedback = feedback; },
      error: (error) => { console.error('Error loading feedback:', error); this.snackBar.open('Error loading feedback', 'Close', { duration: 3000 }); }
    });
  }

  loadHistory(): void {
    this.apiService.getHistory().subscribe({
      next: (history) => { this.history = history; },
      error: (error) => { console.error('Error loading history:', error); this.snackBar.open('Error loading history', 'Close', { duration: 3000 }); }
    });
  }

  openProductForm(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, { width: '600px', data: product });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Delete product "${product.name}"?`)) {
      this.apiService.deleteProduct(product.id).subscribe({
        next: () => { this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 }); this.loadProducts(); },
        error: (error) => { console.error('Error deleting product:', error); this.snackBar.open('Error deleting product', 'Close', { duration: 3000 }); }
      });
    }
  }

  addCategory(): void {
    const name = prompt('Enter category name:');
    if (!name || !name.trim()) return;
    const description = prompt('Enter category description:') || '';
    this.apiService.createCategory({ name: name.trim(), description: description.trim() }).subscribe({
      next: () => { this.snackBar.open('Category created successfully', 'Close', { duration: 3000 }); this.loadCategories(); },
      error: (error) => { console.error('Error creating category:', error); this.snackBar.open('Error creating category', 'Close', { duration: 3000 }); }
    });
  }

  editCategory(category: any): void {
    const name = prompt('Enter new category name:', category.name);
    if (!name || !name.trim()) return;
    const description = prompt('Enter new description:', category.description) || '';
    this.apiService.updateCategory(category.id, { name: name.trim(), description: description.trim() }).subscribe({
      next: () => { this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 }); this.loadCategories(); },
      error: (error) => { console.error('Error updating category:', error); this.snackBar.open('Error updating category', 'Close', { duration: 3000 }); }
    });
  }

  deleteCategory(category: any): void {
    if (confirm(`Delete category "${category.name}"?`)) {
      this.apiService.deleteCategory(category.id).subscribe({
        next: () => { this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 }); this.loadCategories(); },
        error: (error) => { console.error('Error deleting category:', error); this.snackBar.open('Error deleting category', 'Close', { duration: 3000 }); }
      });
    }
  }

  addSupplier(): void {
    const name = prompt('Enter supplier name:');
    if (!name || !name.trim()) return;
    const contact = prompt('Enter supplier contact:') || '';
    const email = prompt('Enter supplier email:') || '';
    const address = prompt('Enter supplier address:') || '';
    this.apiService.createSupplier({ name: name.trim(), contact: contact.trim(), email: email.trim(), address: address.trim() }).subscribe({
      next: () => { this.snackBar.open('Supplier created successfully', 'Close', { duration: 3000 }); this.loadSuppliers(); },
      error: (error) => { console.error('Error creating supplier:', error); this.snackBar.open('Error creating supplier', 'Close', { duration: 3000 }); }
    });
  }

  editSupplier(supplier: any): void {
    const name = prompt('Enter new supplier name:', supplier.name);
    if (!name || !name.trim()) return;
    const contact = prompt('Enter new contact:', supplier.contact) || '';
    const email = prompt('Enter new email:', supplier.email) || '';
    const address = prompt('Enter new address:', supplier.address) || '';
    this.apiService.updateSupplier(supplier.id, { name: name.trim(), contact: contact.trim(), email: email.trim(), address: address.trim() }).subscribe({
      next: () => { this.snackBar.open('Supplier updated successfully', 'Close', { duration: 3000 }); this.loadSuppliers(); },
      error: (error) => { console.error('Error updating supplier:', error); this.snackBar.open('Error updating supplier', 'Close', { duration: 3000 }); }
    });
  }

  deleteSupplier(supplier: any): void {
    if (confirm(`Delete supplier "${supplier.name}"?`)) {
      this.apiService.deleteSupplier(supplier.id).subscribe({
        next: () => { this.snackBar.open('Supplier deleted successfully', 'Close', { duration: 3000 }); this.loadSuppliers(); },
        error: (error) => { console.error('Error deleting supplier:', error); this.snackBar.open('Error deleting supplier', 'Close', { duration: 3000 }); }
      });
    }
  }
}
