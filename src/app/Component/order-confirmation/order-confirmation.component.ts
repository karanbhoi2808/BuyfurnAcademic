import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent implements OnInit {
  orderNumber: string = '';
  orderDate: Date = new Date();

  ngOnInit(): void {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `BF-${randomNum}`;
  }
}
