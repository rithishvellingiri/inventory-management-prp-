import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject: BehaviorSubject<CartItem[]>;
  public cartItems: Observable<CartItem[]>;

  constructor() {
    const storedCart = localStorage.getItem('cart');
    this.cartItemsSubject = new BehaviorSubject<CartItem[]>(
      storedCart ? JSON.parse(storedCart) : []
    );
    this.cartItems = this.cartItemsSubject.asObservable();
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
    const items = this.cartItemsValue;
    const existingItem = items.find(item => item.productId === productId);

    if (existingItem) {
      if (existingItem.quantity < stock) {
        existingItem.quantity++;
      }
    } else {
      items.push({
        productId,
        productName,
        price,
        quantity: 1,
        stock
      });
    }

    this.updateCart(items);
  }

  updateQuantity(productId: string, quantity: number): void {
    const items = this.cartItemsValue;
    const item = items.find(i => i.productId === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else if (quantity <= item.stock) {
        item.quantity = quantity;
        this.updateCart(items);
      }
    }
  }

  removeFromCart(productId: string): void {
    const items = this.cartItemsValue.filter(item => item.productId !== productId);
    this.updateCart(items);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  private updateCart(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }
}
