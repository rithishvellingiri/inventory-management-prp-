import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <div class="products-container">
      <div class="products-header">
        <h1>Browse Products</h1>

        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="filterProducts()" placeholder="Search products...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="selectedCategory" (selectionChange)="filterProducts()">
              <mat-option value="">All Categories</mat-option>
              <mat-option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="products-grid">
        <mat-card *ngFor="let product of filteredProducts" class="product-card">
          
          <div class="product-image-container">
            <img [src]="getProductImage(product)" [alt]="product.name" class="product-image" (error)="onImageError($event, product)">
          </div>

          <mat-card-header>
            <mat-card-title>{{product.name}}</mat-card-title>
            <mat-card-subtitle>{{product.categoryName}}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="product-details">
              <p><strong>Price:</strong> ₹{{product.price | number:'1.2-2'}}</p>
              <p><strong>Stock:</strong> {{product.stock}} units</p>
              <p><strong>Supplier:</strong> {{product.supplierName}}</p>
              <p class="description">{{product.description}}</p>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary"
                    (click)="addToCart(product)"
                    [disabled]="product.stock === 0 || !isLoggedIn">
              <mat-icon>add_shopping_cart</mat-icon>
              {{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="filteredProducts.length === 0" class="no-products">
        <mat-icon>inventory_2</mat-icon>
        <p>No products found</p>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .products-header {
      margin-bottom: 2rem;
    }

    .products-header h1 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 250px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    .product-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }

    .product-details p {
      margin: 0.5rem 0;
    }

    .description {
      color: #666;
      font-style: italic;
      margin-top: 1rem;
    }

    mat-card-actions {
      padding: 1rem;
    }

    mat-card-actions button {
      width: 100%;
    }

    .no-products {
      text-align: center;
      padding: 4rem 2rem;
      color: #999;
    }

    .no-products mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
    }

    .product-image-container {
      width: 100%;
      height: 200px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 8px 8px 0 0;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-image:hover {
      transform: scale(1.05);
    }

    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ccc;
      height: 100%;
    }

    .no-image mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 0.5rem;
    }

    .no-image p {
      margin: 0;
      font-size: 0.9rem;
    }

    /* Dark theme only affects background, keeping text in light theme */
    /* :host ::ng-deep .dark-theme .products-header h1 {
      color: #e0e0e0;
    }

    :host ::ng-deep .dark-theme .description {
      color: #b0b0b0;
    } */

    @media (max-width: 768px) {
      .products-container {
        padding: 1rem;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .filters mat-form-field {
        min-width: 100%;
      }
    }
  `]
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  searchTerm = '';
  selectedCategory = '';
  isLoggedIn = false;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private imageService: ImageService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn;
    this.loadData();
  }

  loadData(): void {
    // Load products
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products];
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
      }
    });

    // Load categories
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory ||
        product.categoryId === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please login to add items to cart', 'Close', { duration: 3000 });
      return;
    }

    this.cartService.addToCart(product.id, product.name, product.price, product.stock);
    this.snackBar.open('Product added to cart', 'Close', { duration: 2000 });
  }

  getProductImage(product: Product): string {
    // Prefer backend-provided image; otherwise derive a default from product name
    return (product.image && product.image.trim()) ? product.image : this.imageService.getDefaultImage(product.name);
  }

  onImageError(event: Event, product: Product): void {
    const target = event.target as HTMLImageElement;
    const fallback = this.imageService.getDefaultImage(product.name);
    if (target && target.src !== window.location.origin + '/' + fallback && !target.src.endsWith(fallback)) {
      target.src = fallback;
    }
  }
}
