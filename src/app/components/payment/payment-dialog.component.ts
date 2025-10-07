import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


export interface PaymentDialogData {
  amount: number;
  orderId: string;
  upiId: string;
  merchantName: string;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="payment-dialog">
      <h2 mat-dialog-title>
        <mat-icon>payment</mat-icon>
        Complete Payment
      </h2>

      <mat-dialog-content>
        <div class="payment-info">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {{data.orderId.substring(0, 12)}}...</p>
          <p><strong>Amount to Pay:</strong> <span class="amount">₹{{data.amount | number:'1.2-2'}}</span></p>
        </div>

        <div class="qr-section">
          <h3>Scan QR Code to Pay</h3>
          <div class="qr-container">
            <img [src]="qrCodeImage" alt="Payment QR Code" class="qr-code">
          </div>
          <p class="upi-id">UPI ID: {{data.upiId}}</p>
          <p class="instruction">Scan this QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
        </div>

        <div class="payment-status" *ngIf="paymentStatus">
          <div class="status-message" [class.success]="paymentStatus === 'success'" [class.pending]="paymentStatus === 'pending'">
            <mat-icon *ngIf="paymentStatus === 'success'">check_circle</mat-icon>
            <mat-icon *ngIf="paymentStatus === 'pending'">schedule</mat-icon>
            <p>{{statusMessage}}</p>
          </div>
        </div>

        <div class="payment-timer" *ngIf="!paymentStatus">
          <p>After completing payment in your UPI app, click the button below.</p>
          <button mat-raised-button color="primary" (click)="confirmPayment()">
            <mat-icon>check_circle</mat-icon>
            I Have Paid
          </button>
          <p class="timer-text">Note: Your order will be placed immediately after you confirm.</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" *ngIf="!paymentStatus">Cancel</button>
        <button mat-raised-button color="primary" (click)="onClose()" *ngIf="paymentStatus">
          Continue to Order
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .payment-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #333;
      margin: 0;
    }

    mat-dialog-content {
      padding: 1.5rem 0;
    }

    .payment-info {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .payment-info h3 {
      margin: 0 0 0.75rem 0;
      color: #555;
      font-size: 1.1rem;
    }

    .payment-info p {
      margin: 0.5rem 0;
      color: #666;
    }

    .amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .qr-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .qr-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .qr-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: inline-block;
      margin-bottom: 1rem;
    }

    .qr-code {
      width: 300px;
      height: 300px;
      display: block;
    }

    .upi-id {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin: 1rem 0 0.5rem 0;
    }

    .instruction {
      color: #666;
      font-size: 0.95rem;
      margin: 0;
    }

    .payment-timer {
      text-align: center;
      padding: 1.5rem;
      background-color: #f0f7ff;
      border-radius: 8px;
    }

    .payment-timer p {
      margin: 0.5rem 0;
      color: #555;
    }

    .payment-timer mat-spinner {
      margin: 1rem auto;
    }

    .timer-text {
      font-size: 0.9rem;
      color: #999;
    }

    .payment-status {
      margin: 1rem 0;
    }

    .status-message {
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .status-message.success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-message.pending {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-message mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }

    .status-message p {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    mat-dialog-actions {
      padding: 1rem 0 0 0;
    }

    /* Dark theme only affects background, keeping text in light theme */
    /* :host ::ng-deep .dark-theme h2,
    :host ::ng-deep .dark-theme .qr-section h3,
    :host ::ng-deep .dark-theme .upi-id {
      color: #e0e0e0;
    }

    :host ::ng-deep .dark-theme .payment-info {
      background-color: #424242;
    } */

    @media (max-width: 600px) {
      .payment-dialog {
        min-width: auto;
        width: 100%;
      }

      .qr-code {
        width: 250px;
        height: 250px;
      }
    }
  `]
})
export class PaymentDialogComponent implements OnInit, OnDestroy {
  qrCodeImage = '';
  paymentStatus: 'success' | 'pending' | null = null;
  statusMessage = '';
  private paymentCheckInterval: any;
  private paymentTimeout: any;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {}

  ngOnInit(): void {
    this.qrCodeImage = 'assets/image.png';
    this.startPaymentVerification();
  }

  private startPaymentVerification(): void {
    // No automatic verification; user confirms manually
    // Set a timeout for payment (15 minutes) to invalidate stale dialogs
    this.paymentTimeout = setTimeout(() => {
      this.handlePaymentTimeout();
    }, 15 * 60 * 1000);
  }

  private checkPaymentStatus(): void {}

  confirmPayment(): void {
    if (this.paymentStatus) return;
    // Immediately place order upon user confirmation
    this.handlePaymentSuccess();
  }

  private handlePaymentSuccess(): void {
    if (this.paymentStatus) return; // Already processed
    
    this.paymentStatus = 'success';
    this.statusMessage = 'Payment verified! Your order has been placed successfully.';
    
    // Clear intervals
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
    }
    if (this.paymentTimeout) {
      clearTimeout(this.paymentTimeout);
    }

    // Auto-redirect after 3 seconds
    setTimeout(() => {
      this.dialogRef.close({ 
        success: true, 
        paymentId: 'pay_' + Date.now(),
        autoRedirect: true 
      });
    }, 3000);
  }

  private handlePaymentTimeout(): void {
    this.paymentStatus = 'pending';
    this.statusMessage = 'Payment timeout. Please try again or contact support.';
    
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
    }
  }

  onCancel(): void {
    const confirmCancel = confirm('Are you sure you want to cancel the payment?');
    if (confirmCancel) {
      this.dialogRef.close({ success: false, cancelled: true });
    }
  }

  onClose(): void {
    this.dialogRef.close({ success: true, paymentId: 'pay_' + Date.now() });
  }

  ngOnDestroy(): void {
    // Clean up intervals and timeouts
    if (this.paymentCheckInterval) {
      clearInterval(this.paymentCheckInterval);
    }
    if (this.paymentTimeout) {
      clearTimeout(this.paymentTimeout);
    }
  }
}
