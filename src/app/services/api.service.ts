import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Supplier } from '../models/supplier.model';
import { Order } from '../models/order.model';
import { CartItem } from '../models/cart.model';
import { Feedback } from '../models/feedback.model';
import { History } from '../models/history.model';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    // Helper method to get auth headers
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    // Products API
    getProducts(): Observable<Product[]> {
        return this.http.get<any>(`${this.apiUrl}/products`).pipe(
            map(response => {
                const products = response.data.products;
                // Transform MongoDB _id to id for frontend compatibility
                return products.map((prod: any) => ({
                    id: prod._id || prod.id,
                    name: prod.name,
                    categoryId: prod.categoryId?._id || prod.categoryId?.id || prod.categoryId,
                    categoryName: prod.categoryId?.name,
                    supplierId: prod.supplierId?._id || prod.supplierId?.id || prod.supplierId,
                    supplierName: prod.supplierId?.name,
                    price: prod.price,
                    stock: prod.stock,
                    description: prod.description,
                    image: prod.image,
                    createdAt: prod.createdAt,
                    updatedAt: prod.updatedAt
                }));
            }),
            catchError(error => throwError(() => error))
        );
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<any>(`${this.apiUrl}/products/${id}`).pipe(
            map(response => response.data.product),
            catchError(error => throwError(() => error))
        );
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        return this.http.post<any>(`${this.apiUrl}/products`, product, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.product),
            catchError(error => throwError(() => error))
        );
    }

    updateProduct(id: string, product: Partial<Product>): Observable<Product> {
        return this.http.put<any>(`${this.apiUrl}/products/${id}`, product, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.product),
            catchError(error => throwError(() => error))
        );
    }

    deleteProduct(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/products/${id}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(error => throwError(() => error))
        );
    }

    updateProductStock(id: string, stock: number, operation: 'set' | 'add' | 'subtract'): Observable<Product> {
        return this.http.put<any>(`${this.apiUrl}/products/${id}/stock`, {
            stock,
            operation
        }, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.product),
            catchError(error => throwError(() => error))
        );
    }

    // Categories API
    getCategories(): Observable<Category[]> {
        return this.http.get<any>(`${this.apiUrl}/categories`).pipe(
            map(response => {
                const categories = response.data.categories;
                // Transform MongoDB _id to id for frontend compatibility
                return categories.map((cat: any) => ({
                    id: cat._id || cat.id,
                    name: cat.name,
                    description: cat.description,
                    createdAt: cat.createdAt
                }));
            }),
            catchError(error => throwError(() => error))
        );
    }

    getCategory(id: string): Observable<Category> {
        return this.http.get<any>(`${this.apiUrl}/categories/${id}`).pipe(
            map(response => response.data.category),
            catchError(error => throwError(() => error))
        );
    }

    createCategory(category: Partial<Category>): Observable<Category> {
        return this.http.post<any>(`${this.apiUrl}/categories`, category, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.category),
            catchError(error => throwError(() => error))
        );
    }

    updateCategory(id: string, category: Partial<Category>): Observable<Category> {
        return this.http.put<any>(`${this.apiUrl}/categories/${id}`, category, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.category),
            catchError(error => throwError(() => error))
        );
    }

    deleteCategory(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/categories/${id}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(error => throwError(() => error))
        );
    }

    // Suppliers API
    getSuppliers(): Observable<Supplier[]> {
        return this.http.get<any>(`${this.apiUrl}/suppliers`).pipe(
            map(response => {
                const suppliers = response.data.suppliers;
                // Transform MongoDB _id to id for frontend compatibility
                return suppliers.map((sup: any) => ({
                    id: sup._id || sup.id,
                    name: sup.name,
                    contact: sup.contact,
                    email: sup.email,
                    address: sup.address,
                    createdAt: sup.createdAt
                }));
            }),
            catchError(error => throwError(() => error))
        );
    }

    getSupplier(id: string): Observable<Supplier> {
        return this.http.get<any>(`${this.apiUrl}/suppliers/${id}`).pipe(
            map(response => response.data.supplier),
            catchError(error => throwError(() => error))
        );
    }

    createSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.post<any>(`${this.apiUrl}/suppliers`, supplier, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.supplier),
            catchError(error => throwError(() => error))
        );
    }

    updateSupplier(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
        return this.http.put<any>(`${this.apiUrl}/suppliers/${id}`, supplier, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.supplier),
            catchError(error => throwError(() => error))
        );
    }

    deleteSupplier(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/suppliers/${id}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(error => throwError(() => error))
        );
    }

    // Cart API
    getCart(): Observable<{ items: CartItem[], totalItems: number, totalAmount: number }> {
        return this.http.get<any>(`${this.apiUrl}/cart`, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data),
            catchError(error => throwError(() => error))
        );
    }

    addToCart(productId: string, quantity: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cart/add`, {
            productId,
            quantity
        }, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(error => throwError(() => error))
        );
    }

    updateCartItem(productId: string, quantity: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/cart/update/${productId}`, {
            quantity
        }, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(error => throwError(() => error))
        );
    }

    removeFromCart(productId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/cart/remove/${productId}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(error => throwError(() => error))
        );
    }

    clearCart(): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/cart/clear`, {
            headers: this.getAuthHeaders()
        }).pipe(
            catchError(error => throwError(() => error))
        );
    }

    // Orders API
    getOrders(): Observable<Order[]> {
        return this.http.get<any>(`${this.apiUrl}/orders`, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.orders),
            catchError(error => throwError(() => error))
        );
    }

    getOrder(id: string): Observable<Order> {
        return this.http.get<any>(`${this.apiUrl}/orders/${id}`, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.order),
            catchError(error => throwError(() => error))
        );
    }

    createOrder(order: any): Observable<Order> {
        return this.http.post<any>(`${this.apiUrl}/orders`, order, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.order),
            catchError(error => throwError(() => error))
        );
    }

    // Feedback API
    getFeedback(): Observable<Feedback[]> {
        return this.http.get<any>(`${this.apiUrl}/feedback`, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.feedback),
            catchError(error => throwError(() => error))
        );
    }

    createFeedback(feedback: Partial<Feedback>): Observable<Feedback> {
        return this.http.post<any>(`${this.apiUrl}/feedback`, feedback, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.feedback),
            catchError(error => throwError(() => error))
        );
    }

    // History API
    getHistory(): Observable<History[]> {
        return this.http.get<any>(`${this.apiUrl}/history`, {
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => response.data.history),
            catchError(error => throwError(() => error))
        );
    }
}
