import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CartItem } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { Order, OrderItem } from '../../models/order.model';
import { PaymentDialogComponent } from '../payment/payment-dialog.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="cart-page animate-fade-up">

      <div class="page-header">
        <div>
          <h1 class="page-title">Shopping Cart</h1>
          <p class="page-sub">{{cartItems.length}} {{cartItems.length === 1 ? 'item' : 'items'}}</p>
        </div>
      </div>

      <!-- ── Cart Content ─────────────────────────── -->
      <div class="cart-layout" *ngIf="cartItems.length > 0">

        <!-- Items Column -->
        <div class="items-col">
          <div class="cart-header-row">
            <span>Product</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
            <span></span>
          </div>

          <div class="cart-item animate-slide-left"
               *ngFor="let item of cartItems; let i = index"
               [style.animation-delay]="(i * 0.05) + 's'">

            <!-- Product info -->
            <div class="item-info">
              <div class="item-icon">
                <mat-icon>shopping_bag</mat-icon>
              </div>
              <div>
                <div class="item-name">{{item.productName}}</div>
                <div class="item-unit">₹{{item.price | number:'1.2-2'}} each</div>
              </div>
            </div>

            <!-- Quantity controls -->
            <div class="qty-controls">
              <button class="qty-btn" (click)="updateQuantity(item, -1)">
                <mat-icon>remove</mat-icon>
              </button>
              <span class="qty-val">{{item.quantity}}</span>
              <button class="qty-btn" (click)="updateQuantity(item, 1)"
                      [disabled]="item.quantity >= item.stock">
                <mat-icon>add</mat-icon>
              </button>
            </div>

            <!-- Unit price -->
            <div class="item-price">₹{{item.price | number:'1.2-2'}}</div>

            <!-- Line total -->
            <div class="item-total">₹{{(item.price * item.quantity) | number:'1.2-2'}}</div>

            <!-- Remove -->
            <button class="remove-btn" (click)="removeItem(item)">
              <mat-icon>delete_outline</mat-icon>
            </button>
          </div>

          <!-- Clear Cart -->
          <button class="clear-cart-btn" (click)="clearCart()" id="clear-cart-btn">
            <mat-icon>delete_sweep</mat-icon>
            Clear Cart
          </button>
        </div>

        <!-- Summary Sidebar -->
        <div class="summary-col">
          <div class="summary-card">
            <h3 class="summary-title">Order Summary</h3>

            <div class="summary-rows">
              <div class="summary-row" *ngFor="let item of cartItems">
                <span class="sr-name">{{item.productName}} × {{item.quantity}}</span>
                <span class="sr-val">₹{{(item.price * item.quantity) | number:'1.2-2'}}</span>
              </div>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-total">
              <span>Total</span>
              <span class="total-val">₹{{cartTotal | number:'1.2-2'}}</span>
            </div>

            <div class="summary-note">
              <mat-icon>verified_user</mat-icon>
              <span>Secure checkout via UPI / Razorpay</span>
            </div>

            <button class="checkout-btn" (click)="checkout()" id="checkout-btn">
              <mat-icon>payment</mat-icon>
              Proceed to Checkout
            </button>

            <a routerLink="/products" class="continue-link" id="continue-shopping">
              <mat-icon>arrow_back</mat-icon>
              Continue Shopping
            </a>
          </div>
        </div>
      </div>

      <!-- ── Empty Cart ────────────────────────────── -->
      <div class="empty-cart animate-fade-up" *ngIf="cartItems.length === 0">
        <div class="ec-icon">
          <mat-icon>shopping_cart</mat-icon>
        </div>
        <h2 class="ec-title">Your cart is empty</h2>
        <p class="ec-sub">Looks like you haven't added anything yet.</p>
        <a routerLink="/products" class="shop-btn" id="start-shopping-btn">
          <mat-icon>inventory_2</mat-icon>
          Start Shopping
        </a>
      </div>

    </div>
  `,
  styles: [`
    .cart-page {
      padding: 32px;
      max-width: 1300px;
      margin: 0 auto;
    }
    @media (max-width: 768px) { .cart-page { padding: 16px; } }

    /* Header */
    .page-header { margin-bottom: 28px; }
    .page-title  { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
    .page-sub    { font-size: 0.875rem; color: var(--text-muted); margin-top: 4px; }

    /* ── Layout ──────────────────────────────────── */
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 28px;
      align-items: start;
    }
    @media (max-width: 1024px) { .cart-layout { grid-template-columns: 1fr; } }

    /* ── Items Column ────────────────────────────── */
    .items-col {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .cart-header-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 40px;
      gap: 12px;
      padding: 14px 20px;
      background: var(--bg-surface-2);
      border-bottom: 1px solid var(--border);
      font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-muted);
    }
    @media (max-width: 640px) { .cart-header-row { display: none; } }

    .cart-item {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 40px;
      gap: 12px;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      transition: background var(--transition-fast);
    }
    .cart-item:last-of-type { border-bottom: 1px solid var(--border); }
    .cart-item:hover { background: var(--bg-surface-2); }

    @media (max-width: 640px) {
      .cart-item {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    /* Item Info */
    .item-info { display: flex; align-items: center; gap: 12px; }
    .item-icon {
      width: 44px; height: 44px;
      border-radius: var(--radius-sm);
      background: rgba(108,99,255,0.1);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .item-icon mat-icon { color: var(--primary); font-size: 22px; }
    .item-name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .item-unit { font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; }

    /* Qty Controls */
    .qty-controls { display: flex; align-items: center; gap: 8px; }
    .qty-btn {
      width: 30px; height: 30px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .qty-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
    .qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .qty-btn mat-icon { font-size: 16px; }
    .qty-val { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); min-width: 20px; text-align: center; }

    /* Prices */
    .item-price { font-size: 0.875rem; color: var(--text-muted); }
    .item-total { font-size: 0.95rem; font-weight: 700; color: var(--primary-light); }

    /* Remove */
    .remove-btn {
      background: none; border: none;
      color: var(--text-muted); cursor: pointer;
      width: 34px; height: 34px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition-fast);
    }
    .remove-btn:hover { background: rgba(239,71,111,0.1); color: var(--danger); }
    .remove-btn mat-icon { font-size: 20px; }

    /* Clear Cart */
    .clear-cart-btn {
      display: flex; align-items: center; gap: 6px;
      margin: 16px 20px;
      padding: 8px 16px;
      background: none;
      border: 1px solid rgba(239,71,111,0.3);
      border-radius: var(--radius-sm);
      color: var(--danger); font-size: 0.825rem; font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .clear-cart-btn:hover { background: rgba(239,71,111,0.1); }
    .clear-cart-btn mat-icon { font-size: 18px; }

    /* ── Summary Card ────────────────────────────── */
    .summary-col { position: sticky; top: calc(var(--navbar-height) + 20px); }

    .summary-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 24px;
    }

    .summary-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; }

    .summary-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .summary-row  { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .sr-name { font-size: 0.825rem; color: var(--text-muted); flex: 1; }
    .sr-val  { font-size: 0.825rem; color: var(--text-secondary); font-weight: 600; white-space: nowrap; }

    .summary-divider { height: 1px; background: var(--border); margin: 16px 0; }

    .summary-total {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
      font-size: 1rem; font-weight: 600; color: var(--text-primary);
    }
    .total-val { font-size: 1.4rem; font-weight: 800; color: var(--primary-light); }

    .summary-note {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.78rem; color: var(--text-muted);
      margin-bottom: 20px;
      padding: 10px 12px;
      background: rgba(6,214,160,0.08);
      border-radius: var(--radius-sm);
      border: 1px solid rgba(6,214,160,0.2);
    }
    .summary-note mat-icon { font-size: 16px; color: var(--success); }

    .checkout-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border: none; border-radius: var(--radius-sm);
      color: white; font-size: 0.95rem; font-weight: 700;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 20px var(--primary-glow);
      margin-bottom: 12px;
    }
    .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px var(--primary-glow); }
    .checkout-btn mat-icon { font-size: 20px; }

    .continue-link {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      font-size: 0.85rem; color: var(--text-muted);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .continue-link:hover { color: var(--primary); }
    .continue-link mat-icon { font-size: 16px; }

    /* ── Empty Cart ──────────────────────────────── */
    .empty-cart { text-align: center; padding: 80px 24px; }

    .ec-icon {
      width: 96px; height: 96px;
      background: rgba(108,99,255,0.1);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 28px;
    }
    .ec-icon mat-icon { font-size: 48px; color: var(--primary); }

    .ec-title { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
    .ec-sub   { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 32px; }

    .shop-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 28px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white; font-size: 0.95rem; font-weight: 600;
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 20px var(--primary-glow);
    }
    .shop-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px var(--primary-glow); }
    .shop-btn mat-icon { font-size: 18px; }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  displayedColumns = ['product', 'price', 'quantity', 'total', 'actions'];

  constructor(
    private cartService: CartService,
    private storageService: StorageService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.cartTotal;
    });
    const token = localStorage.getItem('token');
    if (token) {
      this.cartService.refreshFromBackend();
    }
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    this.cartService.updateQuantity(item.productId, newQuantity);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.productId);
    this.snackBar.open('Item removed from cart', 'Close', { duration: 2000 });
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.snackBar.open('Cart cleared', 'Close', { duration: 2000 });
  }

  checkout(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const orderId = this.storageService.generateId();

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        amount: this.cartTotal,
        orderId: orderId,
        upiId: 'rithishvellingiri@oksbi',
        merchantName: 'Rithish Vellingiri'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.processOrder(orderId, result.paymentId);
      } else if (result && result.cancelled) {
        this.snackBar.open('Payment cancelled', 'Close', { duration: 3000 });
      }
    });
  }

  private processOrder(orderId: string, paymentId: string): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const itemsPayload = this.cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const payload = {
      items: itemsPayload,
      totalAmount: this.cartTotal,
      paymentId: paymentId,
      shippingAddress: '',
      notes: ''
    };

    this.apiService.createOrder(payload).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.snackBar.open('✓ Order placed successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/user-dashboard']);
      },
      error: (err: any) => {
        console.error('Order placement failed', err);
        this.snackBar.open('Order failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
