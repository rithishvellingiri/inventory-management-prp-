import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <div class="products-page">

      <!-- ── Header ─────────────────────────────── -->
      <div class="page-header animate-fade-up">
        <div>
          <h1 class="page-title">Browse Products</h1>
          <p class="page-sub">{{filteredProducts.length}} products found</p>
        </div>
      </div>

      <!-- ── Filter Bar ──────────────────────────── -->
      <div class="filter-bar animate-fade-up">
        <div class="search-wrap" [class.focused]="searchFocused">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Search products…"
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterProducts()"
            (focus)="searchFocused=true"
            (blur)="searchFocused=false"
            id="product-search">
          <button class="clear-btn" *ngIf="searchTerm" (click)="searchTerm=''; filterProducts()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="cat-pills">
          <button class="cat-pill" [class.active]="!selectedCategory"
                  (click)="selectedCategory=''; filterProducts()" id="cat-all">
            All
          </button>
          <button class="cat-pill" *ngFor="let cat of categories"
                  [class.active]="selectedCategory === cat.id"
                  (click)="selectedCategory=cat.id; filterProducts()"
                  [id]="'cat-' + cat.id">
            {{cat.name}}
          </button>
        </div>
      </div>

      <!-- ── Skeleton Loading ─────────────────────── -->
      <div class="products-grid" *ngIf="isLoading">
        <div class="skeleton-card" *ngFor="let s of skeletons">
          <div class="skeleton skeleton-img"></div>
          <div style="padding: 16px">
            <div class="skeleton skeleton-line full" style="height:18px; margin:0 0 10px"></div>
            <div class="skeleton skeleton-line short" style="height:13px; margin:0 0 8px"></div>
            <div class="skeleton skeleton-line full" style="height:13px; margin:0 0 16px"></div>
            <div class="skeleton" style="height:38px; border-radius:6px; margin:0"></div>
          </div>
        </div>
      </div>

      <!-- ── Products Grid ────────────────────────── -->
      <div class="products-grid stagger-children" *ngIf="!isLoading">
        <div class="product-card animate-scale-in"
             *ngFor="let product of filteredProducts"
             [class.out-of-stock]="product.stock === 0">

          <!-- Image -->
          <div class="card-img-wrap">
            <img
              [src]="getProductImage(product)"
              [alt]="product.name"
              class="card-img"
              (error)="onImageError($event, product)">
            <!-- Stock badge -->
            <div class="stock-badge" [ngClass]="getStockClass(product)">
              {{getStockLabel(product)}}
            </div>
          </div>

          <!-- Body -->
          <div class="card-body">
            <div class="card-meta">{{product.categoryName}}</div>
            <h3 class="card-title">{{product.name}}</h3>
            <p class="card-desc">{{product.description | slice:0:80}}{{product.description?.length > 80 ? '…' : ''}}</p>

            <div class="card-footer">
              <div class="price-block">
                <span class="price">₹{{product.price | number:'1.2-2'}}</span>
                <span class="stock-info">{{product.stock}} in stock</span>
              </div>
              <button
                class="add-btn"
                [class.disabled]="product.stock === 0 || !isLoggedIn"
                (click)="addToCart(product)"
                [disabled]="product.stock === 0 || !isLoggedIn"
                [id]="'add-' + product.id">
                <mat-icon>{{product.stock === 0 ? 'block' : 'add_shopping_cart'}}</mat-icon>
                <span>{{product.stock === 0 ? 'Out of Stock' : (isLoggedIn ? 'Add to Cart' : 'Login to Buy')}}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Empty State ──────────────────────────── -->
      <div class="empty-state" *ngIf="!isLoading && filteredProducts.length === 0">
        <div class="empty-icon">
          <mat-icon>inventory_2</mat-icon>
        </div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filter to find what you're looking for.</p>
        <button class="clear-filter-btn" (click)="searchTerm=''; selectedCategory=''; filterProducts()">
          Clear Filters
        </button>
      </div>

    </div>
  `,
  styles: [`
    .products-page {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      animation: fadeInUp 0.35s ease;
    }

    @media (max-width: 768px) { .products-page { padding: 16px; } }

    /* ── Header ──────────────────────────────────── */
    .page-header {
      margin-bottom: 28px;
    }
    .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
    .page-sub   { font-size: 0.875rem; color: var(--text-muted); margin-top: 4px; }

    /* ── Filter Bar ──────────────────────────────── */
    .filter-bar {
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .search-wrap {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg-surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0 14px;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      min-width: 300px;
    }
    .search-wrap.focused { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
    .search-icon { color: var(--text-muted); font-size: 18px; }
    .search-wrap.focused .search-icon { color: var(--primary); }

    .search-input {
      flex: 1; background: none; border: none; outline: none;
      color: var(--text-primary); font-size: 0.9rem;
      font-family: 'Inter', sans-serif; padding: 12px 0;
    }
    .search-input::placeholder { color: var(--text-disabled); }

    .clear-btn {
      background: none; border: none; cursor: pointer;
      color: var(--text-muted); display: flex; align-items: center;
      transition: color var(--transition-fast);
    }
    .clear-btn:hover { color: var(--danger); }
    .clear-btn mat-icon { font-size: 18px; }

    /* Category Pills */
    .cat-pills { display: flex; gap: 8px; flex-wrap: wrap; }

    .cat-pill {
      padding: 7px 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 99px;
      color: var(--text-muted); font-size: 0.825rem; font-weight: 500;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .cat-pill:hover { border-color: var(--primary); color: var(--primary); }
    .cat-pill.active {
      background: rgba(108,99,255,0.15);
      border-color: var(--primary);
      color: var(--primary);
      font-weight: 600;
    }

    /* ── Products Grid ────────────────────────────── */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    @media (max-width: 640px) { .products-grid { grid-template-columns: 1fr; } }

    /* ── Product Card ────────────────────────────── */
    .product-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: all var(--transition-base);
      display: flex; flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-6px);
      border-color: rgba(108,99,255,0.4);
      box-shadow: 0 12px 48px rgba(108,99,255,0.18);
    }

    .product-card.out-of-stock { opacity: 0.65; }
    .product-card.out-of-stock:hover { transform: none; }

    /* Image */
    .card-img-wrap {
      position: relative; overflow: hidden;
      height: 210px; background: var(--bg-surface-2);
    }
    .card-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s ease;
    }
    .product-card:hover .card-img { transform: scale(1.06); }

    /* Stock badge */
    .stock-badge {
      position: absolute; top: 12px; right: 12px;
      padding: 3px 10px; border-radius: 99px;
      font-size: 0.68rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      backdrop-filter: blur(8px);
    }
    .stock-badge.in-stock  { background: rgba(6,214,160,0.2); color: var(--success); border: 1px solid rgba(6,214,160,0.4); }
    .stock-badge.low-stock { background: rgba(255,209,102,0.2); color: var(--accent); border: 1px solid rgba(255,209,102,0.4); animation: pulse-glow 2s infinite; }
    .stock-badge.out       { background: rgba(239,71,111,0.2); color: var(--danger); border: 1px solid rgba(239,71,111,0.4); }

    /* Body */
    .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .card-meta  { font-size: 0.72rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
    .card-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; line-height: 1.4; }
    .card-desc  { font-size: 0.825rem; color: var(--text-muted); line-height: 1.6; flex: 1; margin-bottom: 16px; }

    .card-footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }

    .price-block { display: flex; flex-direction: column; }
    .price { font-size: 1.25rem; font-weight: 800; color: var(--primary-light); }
    .stock-info { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }

    /* Add to Cart button */
    .add-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 14px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border: none; border-radius: var(--radius-sm);
      color: white; font-size: 0.8rem; font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer; white-space: nowrap;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .add-btn:hover:not(.disabled):not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--primary-glow);
    }
    .add-btn.disabled, .add-btn:disabled {
      background: var(--bg-surface-3); box-shadow: none;
      color: var(--text-muted); cursor: not-allowed;
    }
    .add-btn mat-icon { font-size: 16px; }

    /* ── Empty State ─────────────────────────────── */
    .empty-state {
      text-align: center; padding: 80px 24px;
      animation: fadeInUp 0.4s ease;
    }
    .empty-icon {
      width: 80px; height: 80px;
      background: rgba(108,99,255,0.1);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
    }
    .empty-icon mat-icon { font-size: 36px; color: var(--primary); }

    .empty-state h3 { font-size: 1.2rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
    .empty-state p  { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px; }

    .clear-filter-btn {
      padding: 10px 24px;
      background: rgba(108,99,255,0.15);
      border: 1px solid rgba(108,99,255,0.3);
      border-radius: var(--radius-sm);
      color: var(--primary); font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .clear-filter-btn:hover { background: rgba(108,99,255,0.25); }
  `]
})
export class ProductsListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  searchTerm = '';
  selectedCategory = '';
  isLoggedIn = false;
  isLoading = true;
  searchFocused = false;
  skeletons = Array(8).fill(0);

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn;
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });

    this.apiService.getCategories().subscribe({
      next: (categories) => { this.categories = categories; },
      error: (error) => { console.error('Error loading categories:', error); }
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

  getStockClass(product: Product): string {
    if (product.stock === 0) return 'out';
    if (product.stock <= 10) return 'low-stock';
    return 'in-stock';
  }

  getStockLabel(product: Product): string {
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn) {
      this.snackBar.open('Please login to add items to cart', 'Close', { duration: 3000 });
      return;
    }
    this.cartService.addToCart(product.id, product.name, product.price, product.stock);
    this.snackBar.open('✓ ' + product.name + ' added to cart', 'Close', { duration: 2000 });
  }

  getProductImage(product: Product): string {
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
