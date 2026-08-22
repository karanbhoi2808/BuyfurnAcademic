import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-summary',
  imports: [CommonModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  @Input() title: string = 'Order Summary';
  @Input() stepBadge?: number | string;
  @Input() itemCount?: number;
  @Input() subtotal: number = 0;
  @Input() total: number = 0;
  @Input() taxesText: string = 'Included';
  @Input() buttonText: string = 'Proceed to Checkout';
  @Input() buttonIcon: string = 'bi-shield-lock';
  @Input() isSubmitting: boolean = false;
  @Input() showItemsList: boolean = false;
  @Input() items: any[] = [];
  @Input() quantities: { [key: number]: number } = {};
  @Input() showPaymentIcons: boolean = false;

  @Output() actionClick = new EventEmitter<void>();
  @Output() increaseQuantity = new EventEmitter<number>();
  @Output() decreaseQuantity = new EventEmitter<number>();

  onButtonClick(): void {
    if (!this.isSubmitting) {
      this.actionClick.emit();
    }
  }

  onIncrease(productId: number): void {
    this.increaseQuantity.emit(productId);
  }

  onDecrease(productId: number): void {
    this.decreaseQuantity.emit(productId);
  }

  getItemTotal(price: number, productId: number): number {
    const qty = this.quantities[productId] || 1;
    return price * qty;
  }
}
