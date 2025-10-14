import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private defaultImages: { [key: string]: string } = {
    // Electronics
    'smartphone': 'assets/smartphone.png',
    'phone': 'assets/smartphone.png',
    'iphone': 'assets/smartphone.png',
    'samsung': 'assets/smartphone.png',
    'galaxy': 'assets/smartphone.png',
    'mobile': 'assets/smartphone.png',
    'laptop': 'assets/laptop.png',
    'macbook': 'assets/laptop.png',
    'computer': 'assets/laptop.png',
    'desktop': 'assets/laptop.png',
    'tablet': 'assets/electronics.png',
    'headphone': 'assets/electronics.png',
    'speaker': 'assets/electronics.png',
    'camera': 'assets/electronics.png',
    'tv': 'assets/electronics.png',
    'monitor': 'assets/electronics.png',
    'keyboard': 'assets/electronics.png',
    'mouse': 'assets/electronics.png',

    // Home & Kitchen
    'mixer': 'assets/mixer-grinder.png',
    'grinder': 'assets/mixer-grinder.png',
    'blender': 'assets/mixer-grinder.png',
    'kitchenaid': 'assets/mixer-grinder.png',
    'refrigerator': 'assets/home-appliance.png',
    'fridge': 'assets/home-appliance.png',
    'washing': 'assets/home-appliance.png',
    'machine': 'assets/home-appliance.png',
    'microwave': 'assets/home-appliance.png',
    'oven': 'assets/home-appliance.png',
    'stove': 'assets/home-appliance.png',
    'fan': 'assets/home-appliance.png',
    'ac': 'assets/home-appliance.png',
    'air': 'assets/home-appliance.png',
    'conditioner': 'assets/home-appliance.png',
    'iron': 'assets/home-appliance.png',
    'vacuum': 'assets/home-appliance.png',
    'dyson': 'assets/home-appliance.png',
    'cleaner': 'assets/home-appliance.png',

    // Groceries
    'rice': 'assets/rice.png',
    'wheat': 'assets/grocery.png',
    'flour': 'assets/grocery.png',
    'sugar': 'assets/grocery.png',
    'salt': 'assets/grocery.png',
    'oil': 'assets/grocery.png',
    'dal': 'assets/grocery.png',
    'pulse': 'assets/grocery.png',
    'spice': 'assets/grocery.png',
    'masala': 'assets/grocery.png',
    'tea': 'assets/grocery.png',
    'coffee': 'assets/grocery.png',
    'milk': 'assets/grocery.png',
    'bread': 'assets/grocery.png',
    'butter': 'assets/grocery.png',
    'cheese': 'assets/grocery.png',
    'egg': 'assets/grocery.png',
    'fruit': 'assets/grocery.png',
    'vegetable': 'assets/grocery.png',
    'onion': 'assets/grocery.png',
    'potato': 'assets/grocery.png',
    'tomato': 'assets/grocery.png',

    // Clothing
    'shirt': 'assets/tshirt.png',
    't-shirt': 'assets/tshirt.png',
    'tshirt': 'assets/tshirt.png',
    'pant': 'assets/clothing.png',
    'jeans': 'assets/clothing.png',
    'levis': 'assets/clothing.png',
    'nike': 'assets/clothing.png',
    'dress': 'assets/clothing.png',
    'skirt': 'assets/clothing.png',
    'jacket': 'assets/clothing.png',
    'coat': 'assets/clothing.png',
    'sweater': 'assets/clothing.png',
    'hoodie': 'assets/clothing.png',
    'shorts': 'assets/clothing.png',
    'underwear': 'assets/clothing.png',
    'sock': 'assets/clothing.png',
    'shoe': 'assets/clothing.png',
    'boot': 'assets/clothing.png',
    'sandal': 'assets/clothing.png',
    'hat': 'assets/clothing.png',
    'cap': 'assets/clothing.png',
    'belt': 'assets/clothing.png',
    'bag': 'assets/clothing.png',
    'purse': 'assets/clothing.png',
    'wallet': 'assets/clothing.png',

    // Books
    'book': 'assets/book.png',
    'novel': 'assets/book.png',
    'magazine': 'assets/book.png',
    'newspaper': 'assets/book.png',
    'notebook': 'assets/book.png',
    'pen': 'assets/book.png',
    'pencil': 'assets/book.png',
    'paper': 'assets/book.png',
    'javascript': 'assets/book.png',
    'gatsby': 'assets/book.png',
    'stationery': 'assets/book.png',
    'dictionary': 'assets/book.png',
    'encyclopedia': 'assets/book.png',
    'textbook': 'assets/book.png',
    'guide': 'assets/book.png',
    'manual': 'assets/book.png',

    // General fallbacks
    'default': 'assets/image.png',

    // Beauty/Personal care (no dedicated asset, use generic placeholder)
    'loreal': 'assets/soap.png',
    'revitalift': 'assets/soap.png',
    'cream': 'assets/soap.png'
  };

  constructor() { }

  /**
   * Get default image for a product based on its name
   * @param productName The name of the product
   * @returns The path to the default image
   */
  getDefaultImage(productName: string): string {
    if (!productName) {
      return this.defaultImages['default'];
    }

    const name = productName.toLowerCase().trim();

    // Check for exact matches first
    if (this.defaultImages[name]) {
      return this.defaultImages[name];
    }

    // Check for partial matches
    const words = name.split(/[\s\-_]+/);
    for (const word of words) {
      if (this.defaultImages[word]) {
        return this.defaultImages[word];
      }
    }

    // Check for category-based fallbacks
    if (this.isElectronics(name)) {
      return this.defaultImages['smartphone'];
    } else if (this.isHomeAppliance(name)) {
      return this.defaultImages['mixer'];
    } else if (this.isGrocery(name)) {
      return this.defaultImages['rice'];
    } else if (this.isClothing(name)) {
      return this.defaultImages['tshirt'];
    } else if (this.isBook(name)) {
      return this.defaultImages['book'];
    }

    return this.defaultImages['default'];
  }

  /**
   * Get all available default images
   * @returns Array of image paths
   */
  getAvailableImages(): string[] {
    return Object.values(this.defaultImages);
  }

  /**
   * Get images by category
   * @param category The category name
   * @returns Array of image paths for the category
   */
  getImagesByCategory(category: string): string[] {
    const categoryImages: { [key: string]: string[] } = {
      'electronics': [
        'assets/smartphone.png',
        'assets/laptop.png',
        'assets/electronics.png'
      ],
      'home': [
        'assets/mixer-grinder.png',
        'assets/home-appliance.png'
      ],
      'groceries': [
        'assets/rice.png',
        'assets/grocery.png'
      ],
      'clothing': [
        'assets/tshirt.png',
        'assets/clothing.png'
      ],
      'books': [
        'assets/book.png'
      ]
    };

    return categoryImages[category.toLowerCase()] || [this.defaultImages['default']];
  }

  private isElectronics(name: string): boolean {
    const electronicsKeywords = ['phone', 'iphone', 'samsung', 'galaxy', 'laptop', 'macbook', 'computer', 'tablet', 'headphone', 'speaker', 'camera', 'tv', 'monitor', 'keyboard', 'mouse', 'electronic', 'digital', 'smart', 'wireless', 'bluetooth', 'usb', 'charger', 'battery'];
    return electronicsKeywords.some(keyword => name.includes(keyword));
  }

  private isHomeAppliance(name: string): boolean {
    const homeKeywords = ['mixer', 'grinder', 'blender', 'kitchenaid', 'refrigerator', 'fridge', 'washing', 'machine', 'microwave', 'oven', 'stove', 'fan', 'ac', 'air', 'conditioner', 'iron', 'vacuum', 'dyson', 'cleaner', 'appliance', 'kitchen', 'home'];
    return homeKeywords.some(keyword => name.includes(keyword));
  }

  private isGrocery(name: string): boolean {
    const groceryKeywords = ['rice', 'wheat', 'flour', 'sugar', 'salt', 'oil', 'dal', 'pulse', 'spice', 'masala', 'tea', 'coffee', 'milk', 'bread', 'butter', 'cheese', 'egg', 'fruit', 'vegetable', 'onion', 'potato', 'tomato', 'food', 'grocery', 'grain', 'cereal'];
    return groceryKeywords.some(keyword => name.includes(keyword));
  }

  private isClothing(name: string): boolean {
    const clothingKeywords = ['shirt', 't-shirt', 'tshirt', 'pant', 'jeans', 'levis', 'nike', 'dress', 'skirt', 'jacket', 'coat', 'sweater', 'hoodie', 'shorts', 'underwear', 'sock', 'shoe', 'boot', 'sandal', 'hat', 'cap', 'belt', 'bag', 'purse', 'wallet', 'clothing', 'apparel', 'fashion', 'wear'];
    return clothingKeywords.some(keyword => name.includes(keyword));
  }

  private isBook(name: string): boolean {
    const bookKeywords = ['book', 'novel', 'javascript', 'gatsby', 'magazine', 'newspaper', 'notebook', 'pen', 'pencil', 'paper', 'stationery', 'dictionary', 'encyclopedia', 'textbook', 'guide', 'manual', 'literature', 'reading', 'study', 'education'];
    return bookKeywords.some(keyword => name.includes(keyword));
  }
}
