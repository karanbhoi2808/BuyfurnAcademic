import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../../Service/product.service';
import { response } from 'express';
import { error } from 'console';

@Component({
    selector: 'app-my-orders',
    imports: [DatePipe],
    templateUrl: './my-orders.component.html',
    styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {
  private productService = inject(ProductService);


  orderDetails: any = []

  ngOnInit(): void {
    this.myOrders()
  }

  myOrders() {
    this.productService.myOrders().subscribe(
      response => {
        this.orderDetails = response;
      },
      error => {
        console.log(error);
      }
    )
  }
}
