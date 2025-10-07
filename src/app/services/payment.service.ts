import { Injectable } from '@angular/core';

export interface PaymentDetails {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private razorpayKeyId = 'rzp_test_YOUR_KEY_ID';

  constructor() {}

  createOrder(paymentDetails: PaymentDetails): Promise<any> {
    return new Promise((resolve, reject) => {
      const orderData = {
        id: paymentDetails.orderId,
        amount: Math.round(paymentDetails.amount * 100),
        currency: paymentDetails.currency,
        receipt: `receipt_${paymentDetails.orderId}`
      };
      resolve(orderData);
    });
  }

  openPaymentModal(orderData: any, paymentDetails: PaymentDetails): Promise<RazorpayResponse> {
    return new Promise((resolve, reject) => {
      const options = {
        key: this.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Departmental Store',
        description: 'Order Payment',
        order_id: orderData.id,
        prefill: {
          name: paymentDetails.customerName,
          email: paymentDetails.customerEmail
        },
        theme: {
          color: '#667eea'
        },
        handler: (response: RazorpayResponse) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject({ error: 'Payment cancelled by user' });
          }
        }
      };

      if (typeof Razorpay !== 'undefined') {
        const rzp = new Razorpay(options);
        rzp.open();
      } else {
        reject({ error: 'Razorpay SDK not loaded' });
      }
    });
  }

  generateUpiQrData(amount: number, upiId: string, name: string, orderId: string): string {
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}`;
    return upiString;
  }
}
