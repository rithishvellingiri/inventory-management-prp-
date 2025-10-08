import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';

export interface ChatResponse {
  text: string;
  suggestions?: string[];
  products?: Product[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private responses: { [key: string]: string[] } = {
    greeting: [
      "Hello! Welcome to PRP Stores! How can I assist you today?",
      "Hi there! I'm here to help you with any questions about our products and services.",
      "Welcome! I'm your store assistant. What would you like to know?",
      "Hello! Great to see you here. How can I make your shopping experience better?"
    ],
    products: [
      "We have a wide range of products available! You can browse our catalog in the Products section.",
      "Our store offers various categories of products. What specific type of product are you looking for?",
      "I'd be happy to help you find the right product. What are you interested in purchasing?",
      "We have electronics, home appliances, and much more! Check out our Products page for the full catalog."
    ],
    orders: [
      "I can help you with your order status. Please provide your order ID or check your dashboard.",
      "For order-related questions, you can view your order history in your dashboard.",
      "If you have an order issue, I can help you track it or contact support.",
      "Your orders are managed in the 'My Dashboard' section. Would you like me to guide you there?"
    ],
    support: [
      "I'm here to help! What specific issue are you facing?",
      "I can assist you with product information, orders, or general store questions.",
      "Feel free to ask me anything about our store, products, or services.",
      "I'm your personal shopping assistant. How can I make your experience better?"
    ],
    payment: [
      "We accept various payment methods including UPI, cards, and net banking.",
      "For payment issues, please check your payment method or contact our support team.",
      "You can pay securely through our payment gateway during checkout.",
      "If you're having trouble with payment, I can help you with alternative payment options."
    ],
    shipping: [
      "We offer fast and reliable shipping across the country.",
      "Shipping times vary by location. You can check estimated delivery during checkout.",
      "We provide tracking information for all orders once they're shipped.",
      "Free shipping is available on orders above ₹500!"
    ],
    return: [
      "We have a 30-day return policy for most products.",
      "Returns are easy! Just contact us within 30 days of purchase.",
      "You can initiate a return through your dashboard or contact our support team.",
      "We offer hassle-free returns with full refunds for eligible products."
    ],
    default: [
      "I'm not sure I understand. Could you please rephrase your question?",
      "I'm here to help with store-related questions. Could you be more specific?",
      "I can help you with products, orders, payments, or general store information. What would you like to know?",
      "I'm still learning! Could you ask me about our products, orders, or store services?"
    ]
  };

  private keywords: { [key: string]: string } = {
    // Greetings
    'hello': 'greeting',
    'hi': 'greeting',
    'hey': 'greeting',
    'good morning': 'greeting',
    'good afternoon': 'greeting',
    'good evening': 'greeting',
    'welcome': 'greeting',

    // Products
    'product': 'products',
    'products': 'products',
    'catalog': 'products',
    'items': 'products',
    'buy': 'products',
    'purchase': 'products',
    'electronics': 'products',
    'appliances': 'products',
    'mixer': 'products',
    'grinder': 'products',

    // Availability/Stock
    'available': 'availability',
    'availability': 'availability',
    'in stock': 'availability',
    'stock': 'availability',
    'have': 'availability',
    'carry': 'availability',
    'sell': 'availability',
    'price': 'availability',

    // Orders
    'order': 'orders',
    'orders': 'orders',
    'track': 'orders',
    'status': 'orders',
    'shipped': 'orders',
    'history': 'orders',

    // Support
    'help': 'support',
    'support': 'support',
    'assistance': 'support',
    'problem': 'support',
    'issue': 'support',
    'trouble': 'support',

    // Payment
    'payment': 'payment',
    'pay': 'payment',
    'money': 'payment',
    'upi': 'payment',
    'card': 'payment',
    'banking': 'payment',

    // Shipping
    'shipping': 'shipping',
    'delivery': 'shipping',
    'ship': 'shipping',
    'dispatch': 'shipping',
    'courier': 'shipping',

    // Returns
    'return': 'return',
    'returns': 'return',
    'exchange': 'return',
    'refund': 'return',
    'cancel': 'return'
  };

  constructor(private storageService: StorageService) {}

  getResponse(userMessage: string): ChatResponse {
    const message = userMessage.toLowerCase().trim();
    
    // 1) Store-aware availability checks
    const availability = this.getAvailabilityResponse(message);
    if (availability) {
      return availability;
    }

    // 2) Fallback to generic responses by category
    const category = this.categorizeMessage(message);
    const response = this.getRandomResponse(category);
    return {
      text: response,
      suggestions: this.getSuggestions()
    };
  }

  getSuggestions(): string[] {
    return [
      "What products do you have?",
      "Check my orders",
      "Payment options",
      "Shipping information",
      "Return policy",
      "Contact support"
    ];
  }

  private categorizeMessage(message: string): string {
    // Check for exact keyword matches
    for (const [keyword, category] of Object.entries(this.keywords)) {
      if (message.includes(keyword)) {
        return category;
      }
    }

    // Check for partial matches
    const words = message.split(' ');
    for (const word of words) {
      for (const [keyword, category] of Object.entries(this.keywords)) {
        if (keyword.includes(word) || word.includes(keyword)) {
          return category;
        }
      }
    }

    return 'default';
  }

  private getRandomResponse(category: string): string {
    const categoryResponses = this.responses[category] || this.responses.default;
    const randomIndex = Math.floor(Math.random() * categoryResponses.length);
    return categoryResponses[randomIndex];
  }

  // ===== Store-aware logic =====
  private getAvailabilityResponse(message: string): ChatResponse | null {
    const triggerWords = ['available', 'availability', 'in stock', 'stock', 'have', 'carry', 'sell', 'price'];
    const triggered = triggerWords.some(t => message.includes(t));
    
    // Also trigger if message directly mentions a known product name keyword
    const products = this.storageService.getProducts();
    const categories = this.storageService.getCategories();
    const searchTerms = this.extractSearchTerms(message);

    const productMatches = this.searchProducts(products, searchTerms);

    if (triggered || productMatches.length > 0) {
      if (productMatches.length > 0) {
        const top = productMatches.slice(0, 3);
        const lines = top.map(p => `${p.name} – ₹${p.price} (${p.stock > 0 ? p.stock + ' in stock' : 'out of stock'})`);
        const more = productMatches.length > top.length ? ` and ${productMatches.length - top.length} more.` : '';
        return {
          text: `Here's what I found in our store:\n• ${lines.join('\n• ')}${more}`,
          products: top,
          suggestions: [
            'Add to cart',
            'Show more results',
            'Filter by category',
            'See product details'
          ]
        };
      }

      // No direct product matches — share high-level store info
      const categoryNames = (categories || []).map((c: any) => c.name).filter(Boolean);
      const byCategory: { [key: string]: number } = {};
      for (const p of products) {
        const cat = (p as any).categoryName || 'Other';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
      const catLines = Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${name}: ${count}`);

      return {
        text: categoryNames.length
          ? `I couldn't find that exact item. Current availability by category:\n• ${catLines.join('\n• ')}\nTry asking with a specific product name (e.g., "smartphone", "rice").`
          : 'Our catalog is initializing. Please try again shortly.',
        suggestions: this.getSuggestions()
      };
    }

    return null;
  }

  private extractSearchTerms(message: string): string[] {
    const stopWords = new Set([
      'do','you','have','is','are','there','any','the','a','an','in','stock','available','availability','of','for','price','cost','sell','carry','please','can','me','show','find','i','want','to','buy','need','how','much','what'
    ]);
    return message
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  private searchProducts(products: Product[], terms: string[]): Product[] {
    if (!terms.length) return [];
    const termSet = terms;
    const scored = products.map(p => {
      const name = p.name.toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const cat = ((p as any).categoryName || '').toLowerCase();
      let score = 0;
      for (const t of termSet) {
        if (name.includes(t)) score += 3;
        if (desc.includes(t)) score += 2;
        if (cat.includes(t)) score += 1;
      }
      return { p, score };
    }).filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.p);
    return scored;
  }

  // Get product recommendations based on user query
  getProductRecommendations(query: string): Product[] {
    const products = this.storageService.getProducts();
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.categoryName && product.categoryName.toLowerCase().includes(searchTerm))
    ).slice(0, 3);
  }

  // Get order information for user
  getOrderInfo(userId: string, orderId?: string): Order[] {
    const orders = this.storageService.getOrders();
    let userOrders = orders.filter(order => order.userId === userId);
    
    if (orderId) {
      userOrders = userOrders.filter(order => order.id === orderId);
    }
    
    return userOrders.slice(0, 5); // Return last 5 orders
  }

  // Get store statistics
  getStoreStats(): any {
    const products = this.storageService.getProducts();
    const orders = this.storageService.getOrders();
    
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      categories: [...new Set(products.map(p => p.categoryName).filter(Boolean))],
      popularProducts: products
        .sort((a, b) => (b.stock - a.stock))
        .slice(0, 3)
    };
  }
}