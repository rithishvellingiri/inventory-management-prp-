export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  supplierId: string;
  supplierName?: string;
  price: number;
  stock: number;
  description: string;
  image?: string; // URL or path to product image
  createdAt: Date;
  updatedAt: Date;
}
