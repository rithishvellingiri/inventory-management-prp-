import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="cart-container">
      <h1>Shopping Cart</h1>

      <div *ngIf="cartItems.length > 0">
        <mat-card class="cart-card">
          <table mat-table [dataSource]="cartItems" class="cart-table">
            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let item">{{item.productName}}</td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let item">₹{{item.price | number:'1.2-2'}}</td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let item">
                <div class="quantity-controls">
                  <button mat-icon-button (click)="updateQuantity(item, -1)">
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span>{{item.quantity}}</span>
                  <button mat-icon-button (click)="updateQuantity(item, 1)" [disabled]="item.quantity >= item.stock">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let item">₹{{(item.price * item.quantity) | number:'1.2-2'}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let item">
                <button mat-icon-button color="warn" (click)="removeItem(item)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div class="cart-summary">
            <h2>Cart Total: ₹{{cartTotal | number:'1.2-2'}}</h2>
            <div class="cart-actions">
              <button mat-raised-button (click)="clearCart()" color="warn">
                <mat-icon>clear_all</mat-icon>
                Clear Cart
              </button>
              <button mat-raised-button (click)="checkout()" color="primary">
                <mat-icon>payment</mat-icon>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </mat-card>
      </div>

      <div *ngIf="cartItems.length === 0" class="empty-cart">
        <mat-icon>shopping_cart</mat-icon>
        <h2>Your cart is empty</h2>
        <button mat-raised-button color="primary" routerLink="/products">
          Continue Shopping
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 2rem;
      color: #333;
    }

    .cart-card {
      padding : 2rem;
    }

    .cart-table {
      width: 100%;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity-controls span {
      min-width: 2rem;
      text-align: center;
      font-weight: 500;
    }

    .cart-summary {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #e0e0e0;
      text-align: right;
    }

    .cart-summary h2 {
      color: #667eea;
      margin-bottom: 1rem;
    }

    .cart-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-cart mat-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .empty-cart h2 {
      color: #999;
      margin-bottom: 2rem;
    }

    /* Dark theme only affects background, keeping text in light theme */
    /* :host ::ng-deep .dark-theme h1 {
      color: #e0e0e0;
    } */

    @media (max-width: 768px) {
      .cart-table {
        font-size: 0.9rem;
      }

      .cart-actions {
        flex-direction: column;
      }

      .cart-actions button {
        width: 100%;
      }
    }
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
  ) { }

  ngOnInit(): void {
    this.cartService.cartItems.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.cartTotal;
    });
    // Ensure we sync from backend on load if user has a token
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

    // Build payload for backend orders API
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

    // Use ApiService to create order in backend
    this.apiService.createOrder(payload).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/user-dashboard']);
      },
      error: (err: any) => {
        console.error('Order placement failed', err);
        this.snackBar.open('Order failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
