import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon color="primary">inventory_2</mat-icon>
          <h3>{{totalProducts}}</h3>
          <p>Total Products</p>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon color="accent">category</mat-icon>
          <h3>{{totalCategories}}</h3>
          <p>Categories</p>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon color="warn">local_shipping</mat-icon>
          <h3>{{totalSuppliers}}</h3>
          <p>Suppliers</p>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon style="color: #4caf50;">shopping_bag</mat-icon>
          <h3>{{totalOrders}}</h3>
          <p>Total Orders</p>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon style="color: #ff9800;">people</mat-icon>
          <h3>{{totalUsers}}</h3>
          <p>Registered Users</p>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon style="color: #9c27b0;">currency_rupee</mat-icon>
          <h3>₹{{inventoryValue | number:'1.0-0'}}</h3>
          <p>Inventory Value</p>
        </mat-card>
      </div>

      <mat-card *ngIf="lowStockProducts.length > 0" class="alert-card">
        <mat-card-header>
          <mat-icon color="warn">warning</mat-icon>
          <mat-card-title>Low Stock Alert</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>The following products have stock below 10 units:</p>
          <ul>
            <li *ngFor="let product of lowStockProducts">
              <strong>{{product.name}}</strong> - {{product.stock}} units remaining
            </li>
          </ul>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="admin-tabs">
        <mat-tab label="Products">
          <div class="tab-content">
            <button mat-raised-button color="primary" (click)="openProductForm()">
              <mat-icon>add</mat-icon>
              Add New Product
            </button>
            <table mat-table [dataSource]="products" class="data-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let product">{{product.name}}</td>
              </ng-container>
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let product">{{product.categoryName}}</td>
              </ng-container>
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let product">₹{{product.price}}</td>
              </ng-container>
              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let product">{{product.stock}}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let product">
                  <button mat-icon-button color="primary" (click)="openProductForm(product)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteProduct(product)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name', 'category', 'price', 'stock', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'category', 'price', 'stock', 'actions'];"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Categories">
          <div class="tab-content">
            <button mat-raised-button color="primary" (click)="addCategory()">
              <mat-icon>add</mat-icon>
              Add New Category
            </button>
            <table mat-table [dataSource]="categories" class="data-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let category">{{category.name}}</td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let category">{{category.description}}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let category">
                  <button mat-icon-button color="primary" (click)="editCategory(category)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteCategory(category)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name', 'description', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'description', 'actions'];"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Suppliers">
          <div class="tab-content">
            <button mat-raised-button color="primary" (click)="addSupplier()">
              <mat-icon>add</mat-icon>
              Add New Supplier
            </button>
            <table mat-table [dataSource]="suppliers" class="data-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let supplier">{{supplier.name}}</td>
              </ng-container>
              <ng-container matColumnDef="contact">
                <th mat-header-cell *matHeaderCellDef>Contact</th>
                <td mat-cell *matCellDef="let supplier">{{supplier.contact}}</td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let supplier">{{supplier.email}}</td>
              </ng-container>
              <ng-container matColumnDef="address">
                <th mat-header-cell *matHeaderCellDef>Address</th>
                <td mat-cell *matCellDef="let supplier">{{supplier.address}}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let supplier">
                  <button mat-icon-button color="primary" (click)="editSupplier(supplier)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteSupplier(supplier)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name', 'contact', 'email', 'address', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'contact', 'email', 'address', 'actions'];"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Orders">
          <div class="tab-content">
            <table mat-table [dataSource]="orders" class="data-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Order ID</th>
                <td mat-cell *matCellDef="let order">{{order.id.substring(0, 8)}}</td>
              </ng-container>
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let order">{{order.userName}}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let order">₹{{order.totalAmount | number:'1.2-2'}}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let order">{{order.paymentStatus}}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let order">{{order.orderDate | date:'short'}}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['id', 'user', 'amount', 'status', 'date']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['id', 'user', 'amount', 'status', 'date'];"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Feedback">
          <div class="tab-content">
            <table mat-table [dataSource]="feedback" class="data-table">
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let fb">{{fb.userName}}</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let fb">{{fb.type}}</td>
              </ng-container>
              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef>Message</th>
                <td mat-cell *matCellDef="let fb">{{fb.message}}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let fb">{{fb.createdAt | date:'short'}}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['user', 'type', 'message', 'date']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['user', 'type', 'message', 'date'];"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="History">
          <div class="tab-content">
            <table mat-table [dataSource]="history" class="data-table">
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let h">{{h.actionType}}</td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let h">{{h.description}}</td>
              </ng-container>
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let h">{{h.userName || 'System'}}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let h">{{h.createdAt | date:'short'}}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['action', 'description', 'user', 'date']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['action', 'description', 'user', 'date'];"></tr>
            </table>
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
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
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

    .alert-card {
      margin-bottom: 2rem;
      background-color: #fff3cd;
      border-left: 4px solid #ff9800;
    }

    .alert-card mat-card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert-card ul {
      margin: 1rem 0 0 0;
      padding-left: 1.5rem;
    }

    .alert-card li {
      margin: 0.5rem 0;
    }

    .admin-tabs {
      margin-top: 2rem;
    }

    .tab-content {
      padding: 2rem;
    }

    .data-table {
      width: 100%;
      margin-top: 1rem;
    }

    /* Dark theme only affects background, keeping text in light theme */
    /* :host ::ng-deep .dark-theme h1,
    :host ::ng-deep .dark-theme .stat-card h3 {
      color: #e0e0e0;
    }

    :host ::ng-deep .dark-theme .stat-card p {
      color: #b0b0b0;
    } */

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .data-table {
        font-size: 0.85rem;
      }
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

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadSuppliers();
    this.loadOrders();
    this.loadFeedback();
    this.loadHistory();
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
      next: (categories) => {
        this.categories = categories;
        this.totalCategories = categories.length;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
      }
    });
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.totalSuppliers = suppliers.length;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.snackBar.open('Error loading suppliers', 'Close', { duration: 3000 });
      }
    });
  }

  loadOrders(): void {
    this.apiService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.totalOrders = orders.length;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
      }
    });
  }

  loadFeedback(): void {
    this.apiService.getFeedback().subscribe({
      next: (feedback) => {
        this.feedback = feedback;
      },
      error: (error) => {
        console.error('Error loading feedback:', error);
        this.snackBar.open('Error loading feedback', 'Close', { duration: 3000 });
      }
    });
  }

  loadHistory(): void {
    this.apiService.getHistory().subscribe({
      next: (history) => {
        this.history = history;
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.snackBar.open('Error loading history', 'Close', { duration: 3000 });
      }
    });
  }

  openProductForm(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Delete product "${product.name}"?`)) {
      this.apiService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        }
      });
    }
  }

  addCategory(): void {
    const name = prompt('Enter category name:');
    if (!name || !name.trim()) return;

    const description = prompt('Enter category description:') || '';

    const newCategory = {
      name: name.trim(),
      description: description.trim()
    };

    this.apiService.createCategory(newCategory).subscribe({
      next: () => {
        this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.snackBar.open('Error creating category', 'Close', { duration: 3000 });
      }
    });
  }

  editCategory(category: any): void {
    const name = prompt('Enter new category name:', category.name);
    if (!name || !name.trim()) return;

    const description = prompt('Enter new description:', category.description) || '';

    const updatedCategory = {
      name: name.trim(),
      description: description.trim()
    };

    this.apiService.updateCategory(category.id, updatedCategory).subscribe({
      next: () => {
        this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.snackBar.open('Error updating category', 'Close', { duration: 3000 });
      }
    });
  }

  deleteCategory(category: any): void {
    if (confirm(`Delete category "${category.name}"?`)) {
      this.apiService.deleteCategory(category.id).subscribe({
        next: () => {
          this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.snackBar.open('Error deleting category', 'Close', { duration: 3000 });
        }
      });
    }
  }

  addSupplier(): void {
    const name = prompt('Enter supplier name:');
    if (!name || !name.trim()) return;

    const contact = prompt('Enter supplier contact:') || '';
    const email = prompt('Enter supplier email:') || '';
    const address = prompt('Enter supplier address:') || '';

    const newSupplier = {
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      address: address.trim()
    };

    this.apiService.createSupplier(newSupplier).subscribe({
      next: () => {
        this.snackBar.open('Supplier created successfully', 'Close', { duration: 3000 });
        this.loadSuppliers();
      },
      error: (error) => {
        console.error('Error creating supplier:', error);
        this.snackBar.open('Error creating supplier', 'Close', { duration: 3000 });
      }
    });
  }

  editSupplier(supplier: any): void {
    const name = prompt('Enter new supplier name:', supplier.name);
    if (!name || !name.trim()) return;

    const contact = prompt('Enter new contact:', supplier.contact) || '';
    const email = prompt('Enter new email:', supplier.email) || '';
    const address = prompt('Enter new address:', supplier.address) || '';

    const updatedSupplier = {
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      address: address.trim()
    };

    this.apiService.updateSupplier(supplier.id, updatedSupplier).subscribe({
      next: () => {
        this.snackBar.open('Supplier updated successfully', 'Close', { duration: 3000 });
        this.loadSuppliers();
      },
      error: (error) => {
        console.error('Error updating supplier:', error);
        this.snackBar.open('Error updating supplier', 'Close', { duration: 3000 });
      }
    });
  }

  deleteSupplier(supplier: any): void {
    if (confirm(`Delete supplier "${supplier.name}"?`)) {
      this.apiService.deleteSupplier(supplier.id).subscribe({
        next: () => {
          this.snackBar.open('Supplier deleted successfully', 'Close', { duration: 3000 });
          this.loadSuppliers();
        },
        error: (error) => {
          console.error('Error deleting supplier:', error);
          this.snackBar.open('Error deleting supplier', 'Close', { duration: 3000 });
        }
      });
    }
  }

}
