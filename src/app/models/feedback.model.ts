export interface Feedback {
  id: string;
  userId: string;
  userName?: string;
  productId?: string;
  productName?: string;
  message: string;
  type: 'feedback' | 'enquiry';
  chatbotReply?: string;
  createdAt: Date;
}
