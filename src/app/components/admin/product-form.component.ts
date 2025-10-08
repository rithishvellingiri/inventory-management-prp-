import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Supplier } from '../../models/supplier.model';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{isEditMode ? 'Edit' : 'Add'}} Product</h2>
    <mat-dialog-content>
      <form #productForm="ngForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Product Name</mat-label>
          <input matInput [(ngModel)]="product.name" name="name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="product.categoryId" name="category" required>
            <mat-option *ngFor="let cat of categories" [value]="cat.id">{{cat.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Supplier</mat-label>
          <mat-select [(ngModel)]="product.supplierId" name="supplier" required>
            <mat-option *ngFor="let sup of suppliers" [value]="sup.id">{{sup.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Price (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="product.price" name="price" required min="0">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Stock</mat-label>
          <input matInput type="number" [(ngModel)]="product.stock" name="stock" required min="0">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="product.description" name="description" rows="3"></textarea>
        </mat-form-field>

        <!-- Image Upload Section -->
        <div class="image-upload-section">
          <label class="image-upload-label">Product Image</label>
          
          <!-- Default Image Selection -->
          <div class="default-images-section" *ngIf="!product.image">
            <p class="default-images-title">Choose a default image:</p>
            <div class="default-images-grid">
              <div *ngFor="let image of getDefaultImages()" 
                   class="default-image-option"
                   [class.selected]="product.image === image"
                   (click)="selectDefaultImage(image)">
                <img [src]="image" [alt]="'Default image'" class="default-image-preview">
              </div>
            </div>
          </div>

          <div class="image-upload-container">
            <div class="image-preview" *ngIf="product.image">
              <img [src]="product.image" alt="Product preview" class="preview-image">
              <button mat-icon-button class="remove-image" (click)="removeImage()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="upload-area" *ngIf="!product.image" (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon>
              <p>Or upload custom image</p>
              <p class="upload-hint">JPG, PNG, GIF up to 5MB</p>
            </div>
            <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" style="display: none;">
          </div>

          <!-- Or use an Image URL -->
          <div class="image-url-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Image URL (from internet)</mat-label>
              <input matInput [(ngModel)]="imageUrlInput" name="imageUrl" placeholder="https://example.com/image.jpg">
            </mat-form-field>
            <div class="image-url-actions">
              <button mat-stroked-button color="primary" type="button" (click)="applyImageUrl()">
                <mat-icon>link</mat-icon>
                Use Image URL
              </button>
              <span class="url-hint">Accepts http/https URLs. We will validate the image before saving.</span>
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="!productForm.valid">
        {{isEditMode ? 'Update' : 'Add'}} Product
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .image-upload-section {
      margin-bottom: 1rem;
    }

    .image-upload-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .image-upload-container {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      transition: border-color 0.3s ease;
    }

    .image-upload-container:hover {
      border-color: #667eea;
    }

    .image-preview {
      position: relative;
      display: inline-block;
    }

    .preview-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .remove-image {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #f44336;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .remove-image mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .upload-area {
      cursor: pointer;
      padding: 2rem;
      color: #666;
    }

    .upload-area mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .upload-area p {
      margin: 0.5rem 0;
    }

    .upload-hint {
      font-size: 0.8rem;
      color: #999;
    }

    .image-url-section {
      margin-top: 1rem;
    }

    .image-url-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }

    .image-url-actions mat-icon {
      margin-right: 0.25rem;
    }

    .url-hint {
      color: #777;
      font-size: 0.85rem;
    }

    .default-images-section {
      margin-bottom: 1rem;
    }

    .default-images-title {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .default-images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .default-image-option {
      cursor: pointer;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      position: relative;
    }

    .default-image-option:hover {
      border-color: #667eea;
      transform: scale(1.05);
    }

    .default-image-option.selected {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }

    .default-image-preview {
      width: 100%;
      height: 60px;
      object-fit: cover;
    }

    .default-image-option.selected::after {
      content: '✓';
      position: absolute;
      top: 2px;
      right: 2px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  product: Product;
  categories: Category[] = [];
  suppliers: Supplier[] = [];
  isEditMode = false;
  imageUrlInput = '';

  constructor(
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private storageService: StorageService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private imageService: ImageService
  ) {
    if (data) {
      this.product = { ...data };
      this.isEditMode = true;
    } else {
      this.product = {
        id: '',
        name: '',
        categoryId: '',
        supplierId: '',
        price: 0,
        stock: 0,
        description: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  ngOnInit(): void {
    this.categories = this.storageService.getCategories();
    this.suppliers = this.storageService.getSuppliers();
  }

  save(): void {
    const products = this.storageService.getProducts();
    const user = this.authService.currentUserValue;

    if (this.isEditMode) {
      const index = products.findIndex(p => p.id === this.product.id);
      if (index > -1) {
        this.product.updatedAt = new Date();
        products[index] = this.product;
        this.storageService.addHistory({
          id: this.storageService.generateId(),
          userId: user?.id,
          userName: user?.fullName,
          actionType: 'product_update',
          description: `Product updated: ${this.product.name}`,
          createdAt: new Date()
        });
      }
    } else {
      this.product.id = this.storageService.generateId();
      this.product.createdAt = new Date();
      this.product.updatedAt = new Date();
      products.push(this.product);
      this.storageService.addHistory({
        id: this.storageService.generateId(),
        userId: user?.id,
        userName: user?.fullName,
        actionType: 'product_add',
        description: `Product added: ${this.product.name} (Stock: ${this.product.stock}, Price: ₹${this.product.price})`,
        createdAt: new Date()
      });
    }

    this.storageService.saveProducts(products);
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
        return;
      }

      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.product.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.product.image = undefined;
  }

  applyImageUrl(): void {
    const url = (this.imageUrlInput || '').trim();
    if (!url) {
      this.snackBar.open('Please enter an image URL', 'Close', { duration: 3000 });
      return;
    }
    const isValidProtocol = /^https?:\/\//i.test(url);
    if (!isValidProtocol) {
      this.snackBar.open('Image URL must start with http or https', 'Close', { duration: 3000 });
      return;
    }

    // Validate that the URL loads as an image before applying
    const testImage = new Image();
    testImage.onload = () => {
      this.product.image = url;
      this.imageUrlInput = '';
      this.snackBar.open('Image URL applied', 'Close', { duration: 2000 });
    };
    testImage.onerror = () => {
      this.snackBar.open('Could not load image from URL. Please check the link.', 'Close', { duration: 4000 });
    };
    testImage.src = url;
  }

  getDefaultImages(): string[] {
    return this.imageService.getAvailableImages();
  }

  selectDefaultImage(imagePath: string): void {
    this.product.image = imagePath;
  }
}
