export interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentId: string;
  orderDate: Date;
  status: 'processing' | 'completed' | 'cancelled';
}

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}
