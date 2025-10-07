import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StorageService } from '../../services/storage.service';
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
    MatDialogModule
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
    private storageService: StorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.products = this.storageService.getProducts();
    this.categories = this.storageService.getCategories();
    this.suppliers = this.storageService.getSuppliers();
    const users = this.storageService.getUsers();

    this.products.forEach(product => {
      const category = this.categories.find(c => c.id === product.categoryId);
      const supplier = this.suppliers.find(s => s.id === product.supplierId);
      product.categoryName = category?.name || 'Unknown';
      product.supplierName = supplier?.name || 'Unknown';
    });

    this.orders = this.storageService.getOrders();
    this.orders.forEach(order => {
      const user = users.find(u => u.id === order.userId);
      order.userName = user?.fullName || 'Unknown';
    });

    this.feedback = this.storageService.getFeedback();
    this.feedback.forEach(fb => {
      const user = users.find(u => u.id === fb.userId);
      fb.userName = user?.fullName || 'Unknown';
    });

    this.history = this.storageService.getHistory();
    this.totalProducts = this.products.length;
    this.totalCategories = this.categories.length;
    this.totalSuppliers = this.suppliers.length;
    this.totalOrders = this.orders.length;
    this.totalUsers = users.filter(u => u.role === 'user').length;
    this.inventoryValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    this.lowStockProducts = this.products.filter(p => p.stock < 10);
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
      const products = this.storageService.getProducts();
      const index = products.findIndex(p => p.id === product.id);
      if (index > -1) {
        products.splice(index, 1);
        this.storageService.saveProducts(products);
        this.storageService.addHistory({
          id: this.storageService.generateId(),
          actionType: 'product_delete',
          description: `Product deleted: ${product.name}`,
          createdAt: new Date()
        });
        this.loadData();
      }
    }
  }

  addCategory(): void {
    const name = prompt('Enter category name:');
    if (!name || !name.trim()) return;

    const description = prompt('Enter category description:') || '';

    const categories = this.storageService.getCategories();

    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert('Category already exists!');
      return;
    }

    const newCategory = {
      id: this.storageService.generateId(),
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date()
    };

    categories.push(newCategory);
    this.storageService.saveCategories(categories);

    this.storageService.addHistory({
      id: this.storageService.generateId(),
      actionType: 'category_add',
      description: `Category added: ${newCategory.name}`,
      createdAt: new Date()
    });

    this.loadData();
  }

  editCategory(category: any): void {
    const name = prompt('Enter new category name:', category.name);
    if (!name || !name.trim()) return;

    const description = prompt('Enter new description:', category.description) || '';

    const categories = this.storageService.getCategories();
    const existing = categories.find(c => c.id !== category.id && c.name.toLowerCase() === name.toLowerCase());

    if (existing) {
      alert('Category name already exists!');
      return;
    }

    const index = categories.findIndex(c => c.id === category.id);
    if (index > -1) {
      categories[index].name = name.trim();
      categories[index].description = description.trim();
      this.storageService.saveCategories(categories);

      this.storageService.addHistory({
        id: this.storageService.generateId(),
        actionType: 'category_update',
        description: `Category updated: ${name}`,
        createdAt: new Date()
      });

      this.loadData();
    }
  }

  deleteCategory(category: any): void {
    const products = this.storageService.getProducts();
    const hasProducts = products.some(p => p.categoryId === category.id);

    if (hasProducts) {
      alert('Cannot delete category. Products are assigned to this category.');
      return;
    }

    if (confirm(`Delete category "${category.name}"?`)) {
      const categories = this.storageService.getCategories();
      const index = categories.findIndex(c => c.id === category.id);
      if (index > -1) {
        categories.splice(index, 1);
        this.storageService.saveCategories(categories);

        this.storageService.addHistory({
          id: this.storageService.generateId(),
          actionType: 'category_delete',
          description: `Category deleted: ${category.name}`,
          createdAt: new Date()
        });

        this.loadData();
      }
    }
  }

  addSupplier(): void {
    const name = prompt('Enter supplier name:');
    if (!name || !name.trim()) return;

    const contact = prompt('Enter supplier contact:') || '';
    const email = prompt('Enter supplier email:') || '';
    const address = prompt('Enter supplier address:') || '';

    const suppliers = this.storageService.getSuppliers();

    const newSupplier = {
      id: this.storageService.generateId(),
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      address: address.trim(),
      createdAt: new Date()
    };

    suppliers.push(newSupplier);
    this.storageService.saveSuppliers(suppliers);

    this.storageService.addHistory({
      id: this.storageService.generateId(),
      actionType: 'supplier_add',
      description: `Supplier added: ${newSupplier.name}`,
      createdAt: new Date()
    });

    this.loadData();
  }

  editSupplier(supplier: any): void {
    const name = prompt('Enter new supplier name:', supplier.name);
    if (!name || !name.trim()) return;

    const contact = prompt('Enter new contact:', supplier.contact) || '';
    const email = prompt('Enter new email:', supplier.email) || '';
    const address = prompt('Enter new address:', supplier.address) || '';

    const suppliers = this.storageService.getSuppliers();

    const index = suppliers.findIndex(s => s.id === supplier.id);
    if (index > -1) {
      suppliers[index].name = name.trim();
      suppliers[index].contact = contact.trim();
      suppliers[index].email = email.trim();
      suppliers[index].address = address.trim();
      this.storageService.saveSuppliers(suppliers);

      this.storageService.addHistory({
        id: this.storageService.generateId(),
        actionType: 'supplier_update',
        description: `Supplier updated: ${name}`,
        createdAt: new Date()
      });

      this.loadData();
    }
  }

  deleteSupplier(supplier: any): void {
    const products = this.storageService.getProducts();
    const hasProducts = products.some(p => p.supplierId === supplier.id);

    if (hasProducts) {
      alert('Cannot delete supplier. Products are assigned to this supplier.');
      return;
    }

    if (confirm(`Delete supplier "${supplier.name}"?`)) {
      const suppliers = this.storageService.getSuppliers();
      const index = suppliers.findIndex(s => s.id === supplier.id);
      if (index > -1) {
        suppliers.splice(index, 1);
        this.storageService.saveSuppliers(suppliers);

        this.storageService.addHistory({
          id: this.storageService.generateId(),
          actionType: 'supplier_delete',
          description: `Supplier deleted: ${supplier.name}`,
          createdAt: new Date()
        });

        this.loadData();
      }
    }
  }

}
