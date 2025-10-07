import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Supplier } from '../models/supplier.model';
import { Order } from '../models/order.model';
import { Feedback } from '../models/feedback.model';
import { History } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly USERS_KEY = 'ims_users';
  private readonly PRODUCTS_KEY = 'ims_products';
  private readonly CATEGORIES_KEY = 'ims_categories';
  private readonly SUPPLIERS_KEY = 'ims_suppliers';
  private readonly ORDERS_KEY = 'ims_orders';
  private readonly FEEDBACK_KEY = 'ims_feedback';
  private readonly HISTORY_KEY = 'ims_history';

  constructor() {
    this.initializeData();
    this.forceUpdateProductImages();
  }

  private initializeData(): void {
    if (!this.getItem(this.USERS_KEY)) {
      const adminUser: User = {
        id: this.generateId(),
        email: 'admin@store.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: 'admin',
        createdAt: new Date()
      };
      this.setItem(this.USERS_KEY, [adminUser]);
    }

    if (!this.getItem(this.CATEGORIES_KEY)) {
      const categories: Category[] = [
        { id: this.generateId(), name: 'Electronics', description: 'Electronic devices and accessories', createdAt: new Date() },
        { id: this.generateId(), name: 'Groceries', description: 'Food and daily essentials', createdAt: new Date() },
        { id: this.generateId(), name: 'Clothing', description: 'Apparel and fashion items', createdAt: new Date() },
        { id: this.generateId(), name: 'Home & Kitchen', description: 'Home appliances and kitchenware', createdAt: new Date() },
        { id: this.generateId(), name: 'Books', description: 'Books and stationery', createdAt: new Date() }
      ];
      this.setItem(this.CATEGORIES_KEY, categories);
    }

    if (!this.getItem(this.SUPPLIERS_KEY)) {
      const suppliers: Supplier[] = [
        { id: this.generateId(), name: 'TechSupply Co.', contact: '+91-9876543210', email: 'tech@supply.com', address: 'Mumbai, Maharashtra', createdAt: new Date() },
        { id: this.generateId(), name: 'Fresh Foods Ltd.', contact: '+91-9876543211', email: 'contact@freshfoods.com', address: 'Delhi, India', createdAt: new Date() },
        { id: this.generateId(), name: 'Fashion House', contact: '+91-9876543212', email: 'info@fashionhouse.com', address: 'Bangalore, Karnataka', createdAt: new Date() }
      ];
      this.setItem(this.SUPPLIERS_KEY, suppliers);
    }

    if (!this.getItem(this.PRODUCTS_KEY)) {
      const categories = this.getItem(this.CATEGORIES_KEY) || [];
      const suppliers = this.getItem(this.SUPPLIERS_KEY) || [];
      const products: Product[] = [
        { id: this.generateId(), name: 'Smartphone', categoryId: categories[0]?.id, supplierId: suppliers[0]?.id, price: 15999, stock: 25, description: 'Latest smartphone with high-end features', image: 'assets/smartphone.png', createdAt: new Date(), updatedAt: new Date() },
        { id: this.generateId(), name: 'Laptop', categoryId: categories[0]?.id, supplierId: suppliers[0]?.id, price: 45999, stock: 15, description: 'Powerful laptop for work and gaming', image: 'assets/laptop.png', createdAt: new Date(), updatedAt: new Date() },
        { id: this.generateId(), name: 'Rice (5kg)', categoryId: categories[1]?.id, supplierId: suppliers[1]?.id, price: 299, stock: 100, description: 'Premium quality basmati rice', image: 'assets/rice.png', createdAt: new Date(), updatedAt: new Date() },
        { id: this.generateId(), name: 'T-Shirt', categoryId: categories[2]?.id, supplierId: suppliers[2]?.id, price: 499, stock: 50, description: 'Comfortable cotton t-shirt', image: 'assets/tshirt.png', createdAt: new Date(), updatedAt: new Date() },
        { id: this.generateId(), name: 'Mixer Grinder', categoryId: categories[3]?.id, supplierId: suppliers[0]?.id, price: 2999, stock: 8, description: 'Powerful mixer grinder for kitchen', image: 'assets/mixer-grinder.png', createdAt: new Date(), updatedAt: new Date() },
        { id: this.generateId(), name: 'soap', categoryId: categories[1]?.id, supplierId: suppliers[1]?.id, price: 1, stock: 49, description: 'Fresh and clean soap', image: 'assets/grocery.png', createdAt: new Date(), updatedAt: new Date() }
      ];
      this.setItem(this.PRODUCTS_KEY, products);
    }

    if (!this.getItem(this.ORDERS_KEY)) {
      this.setItem(this.ORDERS_KEY, []);
    }

    if (!this.getItem(this.FEEDBACK_KEY)) {
      this.setItem(this.FEEDBACK_KEY, []);
    }

    if (!this.getItem(this.HISTORY_KEY)) {
      this.setItem(this.HISTORY_KEY, []);
    }
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getItem(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getUsers(): User[] {
    return this.getItem(this.USERS_KEY) || [];
  }

  saveUsers(users: User[]): void {
    this.setItem(this.USERS_KEY, users);
  }

  getProducts(): Product[] {
    const products = this.getItem(this.PRODUCTS_KEY) || [];
    // Ensure all products have default images
    return this.assignDefaultImages(products);
  }

  saveProducts(products: Product[]): void {
    this.setItem(this.PRODUCTS_KEY, products);
  }

  /**
   * Assign default images to products that don't have images
   * @param products Array of products
   * @returns Updated products with default images
   */
  assignDefaultImages(products: Product[]): Product[] {
    return products.map(product => {
      if (!product.image) {
        product.image = this.getDefaultImageForProduct(product.name);
      }
      return product;
    });
  }

  /**
   * Get default image for a product based on its name
   * @param productName The name of the product
   * @returns The path to the default image
   */
  private getDefaultImageForProduct(productName: string): string {
    if (!productName) {
      return 'assets/image.png';
    }

    const name = productName.toLowerCase().trim();
    
    // Electronics
    if (name.includes('smartphone') || name.includes('phone') || name.includes('mobile')) {
      return 'assets/smartphone.png';
    }
    if (name.includes('laptop') || name.includes('computer') || name.includes('desktop')) {
      return 'assets/laptop.png';
    }
    if (name.includes('tablet') || name.includes('headphone') || name.includes('speaker') || name.includes('camera') || name.includes('tv') || name.includes('monitor')) {
      return 'assets/electronics.png';
    }
    
    // Home & Kitchen
    if (name.includes('mixer') || name.includes('grinder') || name.includes('blender')) {
      return 'assets/mixer-grinder.png';
    }
    if (name.includes('refrigerator') || name.includes('fridge') || name.includes('washing') || name.includes('machine') || name.includes('microwave') || name.includes('oven') || name.includes('stove') || name.includes('fan') || name.includes('ac') || name.includes('air') || name.includes('conditioner') || name.includes('iron') || name.includes('vacuum') || name.includes('cleaner')) {
      return 'assets/home-appliance.png';
    }
    
    // Groceries
    if (name.includes('rice') || name.includes('wheat') || name.includes('flour') || name.includes('sugar') || name.includes('salt') || name.includes('oil') || name.includes('dal') || name.includes('pulse') || name.includes('spice') || name.includes('masala') || name.includes('tea') || name.includes('coffee') || name.includes('milk') || name.includes('bread') || name.includes('butter') || name.includes('cheese') || name.includes('egg') || name.includes('fruit') || name.includes('vegetable') || name.includes('onion') || name.includes('potato') || name.includes('tomato') || name.includes('soap') || name.includes('shampoo') || name.includes('detergent') || name.includes('toothpaste') || name.includes('cream') || name.includes('lotion')) {
      return 'assets/grocery.png';
    }
    
    // Clothing
    if (name.includes('shirt') || name.includes('t-shirt') || name.includes('tshirt') || name.includes('pant') || name.includes('jeans') || name.includes('dress') || name.includes('skirt') || name.includes('jacket') || name.includes('coat') || name.includes('sweater') || name.includes('hoodie') || name.includes('shorts') || name.includes('underwear') || name.includes('sock') || name.includes('shoe') || name.includes('boot') || name.includes('sandal') || name.includes('hat') || name.includes('cap') || name.includes('belt') || name.includes('bag') || name.includes('purse') || name.includes('wallet')) {
      return 'assets/tshirt.png';
    }
    
    // Books
    if (name.includes('book') || name.includes('novel') || name.includes('magazine') || name.includes('newspaper') || name.includes('notebook') || name.includes('pen') || name.includes('pencil') || name.includes('paper') || name.includes('stationery') || name.includes('dictionary') || name.includes('encyclopedia') || name.includes('textbook') || name.includes('guide') || name.includes('manual')) {
      return 'assets/book.png';
    }
    
    return 'assets/image.png';
  }

  /**
   * Force update all existing products with correct images
   */
  private forceUpdateProductImages(): void {
    const products = this.getItem(this.PRODUCTS_KEY);
    if (products && products.length > 0) {
      const updatedProducts = products.map((product: Product) => {
        // Force update image based on product name
        product.image = this.getDefaultImageForProduct(product.name);
        return product;
      });
      this.setItem(this.PRODUCTS_KEY, updatedProducts);
    }
  }

  getCategories(): Category[] {
    return this.getItem(this.CATEGORIES_KEY) || [];
  }

  saveCategories(categories: Category[]): void {
    this.setItem(this.CATEGORIES_KEY, categories);
  }

  getSuppliers(): Supplier[] {
    return this.getItem(this.SUPPLIERS_KEY) || [];
  }

  saveSuppliers(suppliers: Supplier[]): void {
    this.setItem(this.SUPPLIERS_KEY, suppliers);
  }

  getOrders(): Order[] {
    return this.getItem(this.ORDERS_KEY) || [];
  }

  saveOrders(orders: Order[]): void {
    this.setItem(this.ORDERS_KEY, orders);
  }

  getFeedback(): Feedback[] {
    return this.getItem(this.FEEDBACK_KEY) || [];
  }

  saveFeedback(feedback: Feedback[]): void {
    this.setItem(this.FEEDBACK_KEY, feedback);
  }

  getHistory(): History[] {
    return this.getItem(this.HISTORY_KEY) || [];
  }

  saveHistory(history: History[]): void {
    this.setItem(this.HISTORY_KEY, history);
  }

  addHistory(history: History): void {
    const histories = this.getHistory();
    histories.unshift(history);
    this.saveHistory(histories);
  }
}
