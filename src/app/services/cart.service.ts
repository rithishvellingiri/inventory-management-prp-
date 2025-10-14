import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart.model';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject: BehaviorSubject<CartItem[]>;
  public cartItems: Observable<CartItem[]>;

  constructor(private api: ApiService) {
    const storedCart = localStorage.getItem('cart');
    this.cartItemsSubject = new BehaviorSubject<CartItem[]>(
      storedCart ? JSON.parse(storedCart) : []
    );
    this.cartItems = this.cartItemsSubject.asObservable();
    // Attempt to hydrate from backend cart if token exists
    const token = localStorage.getItem('token');
    if (token) {
      this.refreshFromBackend();
    }
  }

  public get cartItemsValue(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  public get cartCount(): number {
    return this.cartItemsValue.reduce((sum, item) => sum + item.quantity, 0);
  }

  public get cartTotal(): number {
    return this.cartItemsValue.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  addToCart(productId: string, productName: string, price: number, stock: number): void {
    // Optimistic local update
    const items = this.cartItemsValue;
    const existingItem = items.find(item => item.productId === productId);
    let nextQuantity = 1;
    if (existingItem) {
      if (existingItem.quantity < stock) {
        existingItem.quantity++;
        nextQuantity = existingItem.quantity;
      }
    } else {
      items.push({ productId, productName, price, quantity: 1, stock });
    }
    this.updateCart(items);
    // Persist to backend
    this.api.addToCart(productId, 1).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => {
        // Rollback on error
        if (existingItem) {
          existingItem.quantity = Math.max(existingItem.quantity - 1, 0);
          if (existingItem.quantity === 0) {
            this.removeFromCart(productId);
          } else {
            this.updateCart([...this.cartItemsValue]);
          }
        } else {
          this.removeFromCart(productId);
        }
      }
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    const items = this.cartItemsValue;
    const item = items.find(i => i.productId === productId);
    if (!item) return;
    const previous = item.quantity;
    if (quantity <= 0) {
      this.removeFromCart(productId);
      this.api.removeFromCart(productId).subscribe({
        next: () => this.refreshFromBackend(),
        error: () => this.refreshFromBackend()
      });
      return;
    }
    if (quantity <= item.stock) {
      item.quantity = quantity;
      this.updateCart(items);
      this.api.updateCartItem(productId, quantity).subscribe({
        next: () => this.refreshFromBackend(),
        error: () => {
          item.quantity = previous;
          this.updateCart([...this.cartItemsValue]);
        }
      });
    }
  }

  removeFromCart(productId: string): void {
    const items = this.cartItemsValue.filter(item => item.productId !== productId);
    this.updateCart(items);
    this.api.removeFromCart(productId).subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.refreshFromBackend()
    });
  }

  clearCart(): void {
    this.updateCart([]);
    this.api.clearCart().subscribe({
      next: () => this.refreshFromBackend(),
      error: () => this.refreshFromBackend()
    });
  }

  private updateCart(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }

  refreshFromBackend(): void {
    this.api.getCart().pipe(
      map(data => data.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        quantity: i.quantity,
        stock: i.stock
      }) as CartItem))
    ).subscribe({
      next: (items) => this.updateCart(items),
      error: () => { }
    });
  }
}
