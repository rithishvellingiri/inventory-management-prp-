import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatbotService } from '../../services/chatbot.service';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'product';
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatTooltipModule,
    FormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="chatbot-container" [class.open]="isOpen">
      <
      <button 
        mat-fab 
        color="primary" 
        class="chatbot-toggle"
        (click)="toggleChat()"
        [class.open]="isOpen"
        matTooltip="Chat with Store Assistant"
        title="Chat with Store Assistant"
      >
        <mat-icon *ngIf="!isOpen">chat</mat-icon>
        <mat-icon *ngIf="isOpen">close</mat-icon>
      </button>

      
      <div class="chat-window" *ngIf="isOpen">
        <div class="chat-header">
          <div class="chat-title">
            <mat-icon>smart_toy</mat-icon>
            <span>Store Assistant</span>
          </div>
          <button mat-icon-button (click)="toggleChat()" class="close-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="chat-messages" #messagesContainer>
          <div 
            *ngFor="let message of messages" 
            class="message"
            [class.user-message]="message.isUser"
            [class.bot-message]="!message.isUser"
          >
            <div class="message-content">
              <div class="message-text">{{message.text}}</div>
              <div class="message-time">{{message.timestamp | date:'short'}}</div>
            </div>
            <div class="message-avatar" *ngIf="!message.isUser">
              <mat-icon>smart_toy</mat-icon>
            </div>
          </div>

          
          <div class="typing-indicator" *ngIf="isTyping">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-text">Assistant is typing...</span>
          </div>
        </div>

        <!-- Quick Suggest -->
        <div class="quick-suggestions" *ngIf="suggestions.length > 0 && !isTyping">
          <div class="suggestions-title">Quick Actions:</div>
          <button 
            *ngFor="let suggestion of suggestions" 
            mat-stroked-button 
            class="suggestion-btn"
            (click)="sendSuggestion(suggestion)"
          >
            {{suggestion}}
          </button>
        </div>

        <!-- Input field -->
        <div class="chat-input">
          <mat-form-field appearance="outline" class="message-input">
            <mat-label>Type your message...</mat-label>
            <input 
              matInput 
              [(ngModel)]="currentMessage" 
              (keyup.enter)="sendMessage()"
              [disabled]="isTyping"
              placeholder="Ask about products, orders, or store info"
            />
          </mat-form-field>
          <button 
            mat-icon-button 
            color="primary" 
            (click)="sendMessage()"
            [disabled]="!currentMessage.trim() || isTyping"
          >
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  
  styles: [`
    <!-- style Area -->
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: block !important;
    }

    .chatbot-toggle {
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      width: 56px;
      height: 56px;
      background: #667eea !important;
      color: white !important;
    }

    .chatbot-toggle:hover {
      background: #5a6fd8 !important;
      transform: scale(1.1);
    }

    .chatbot-toggle.open {
      transform: rotate(45deg);
    }

    .chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .close-btn {
      color: white;
    }

    .chat-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      background: #f8f9fa;
    }

    .message {
      display: flex;
      margin-bottom: 1rem;
      gap: 0.5rem;
    }

    .user-message {
      flex-direction: row-reverse;
    }

    .message-content {
      max-width: 80%;
      padding: 0.75rem 1rem;
      border-radius: 18px;
      position: relative;
    }

    .user-message .message-content {
      background: #667eea;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .bot-message .message-content {
      background: white;
      color: #333;
      border: 1px solid #e0e0e0;
      border-bottom-left-radius: 4px;
    }

    .message-text {
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .message-time {
      font-size: 0.7rem;
      opacity: 0.7;
      margin-top: 0.25rem;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      background: #667eea;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: white;
      border-radius: 18px;
      border: 1px solid #e0e0e0;
      max-width: 80%;
    }

    .typing-dots {
      display: flex;
      gap: 3px;
    }

    .typing-dots span {
      width: 6px;
      height: 6px;
      background: #667eea;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }

    .typing-text {
      font-size: 0.8rem;
      color: #666;
    }

    .quick-suggestions {
      padding: 1rem;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    .suggestions-title {
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .suggestion-btn {
      margin: 0.25rem;
      font-size: 0.8rem;
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
    }

    .chat-input {
      padding: 1rem;
      background: white;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .message-input {
      flex: 1;
    }

    .message-input ::ng-deep .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
    }

    .message-input ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    @media (max-width: 480px) {
      .chat-window {
        width: 300px;
        height: 400px;
        right: -10px;
      }
    }
  `]
})
export class ChatbotComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  isTyping = false;
  suggestions: string[] = [];

  private chatbotService = inject(ChatbotService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    console.log('Chatbot component initialized');
    this.initializeChat();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeChat(): void {
    // Add welcome message
    this.addMessage('Hello! I\'m your store assistant. How can I help you today?', false);
    this.updateSuggestions();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const userMessage = this.currentMessage.trim();
    this.addMessage(userMessage, true);
    this.currentMessage = '';
    this.suggestions = [];

    this.isTyping = true;
    this.scrollToBottom();

    // Simulate typing delay
    setTimeout(() => {
      this.handleBotResponse(userMessage);
    }, 1000 + Math.random() * 1000);
  }

  sendSuggestion(suggestion: string): void {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  private handleBotResponse(userMessage: string): void {
    const response = this.chatbotService.getResponse(userMessage);
    this.addMessage(response.text, false);
    this.isTyping = false;
    this.updateSuggestions();
    this.scrollToBottom();
  }

  private addMessage(text: string, isUser: boolean): void {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    };
    this.messages.push(message);
  }

  private updateSuggestions(): void {
    this.suggestions = this.chatbotService.getSuggestions();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }
}
