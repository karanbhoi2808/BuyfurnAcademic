import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../Service/product.service';
import { Product } from '../../Interface/product';
import { UserService } from '../../Service/user.service';
import { OrderDetails } from '../../Interface/orderdetails';
import { UserAuthService } from '../../Service/user-auth.service';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import Swal from 'sweetalert2';
import { EmailService } from '../../Service/email.service';

declare var Razorpay: any;

@Component({
  selector: 'app-buy-product',
  imports: [CommonModule, FormsModule, RouterLink, OrderSummaryComponent],
  templateUrl: './buy-product.component.html',
  styleUrls: ['./buy-product.component.css']
})
export class BuyProductComponent implements OnInit {
  @ViewChild('orderForm') orderForm?: NgForm;

  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);
  private userAuthService = inject(UserAuthService);
  private emailService = inject(EmailService);

  isLoading: boolean = true;
  isSubmitting: boolean = false;
  productQuantities: { [key: number]: number } = {};

  orderDetails: OrderDetails = {
    fullName: '',
    address: {
      address: '',
      pincode: '',
      city: '',
      state: ''
    },
    contactNumber: '',
    orderQuantities: [],
    transactionId: ''
  };

  products: Product[] | undefined;
  user: any = {};
  isSingleProductCheckout: boolean = false;

  EmailRequest: any = {
    to: '',
    subject: '',
    text: ''
  };

  ngOnInit(): void {
    this.loadUserData();

    this.route.queryParams.subscribe(params => {
      this.isSingleProductCheckout = params['isSingleProductCheckout'] === 'true';
    });

    this.products = this.route.snapshot.data['productDetails'];

    if (this.products) {
      this.products.forEach(product => {
        this.productQuantities[product.id] = 1;
      });
    }
  }

  loadUserData(): void {
    if (typeof window !== 'undefined' && localStorage.getItem('basicAuth')) {
      this.userService.login().subscribe({
        next: (response) => {
          this.isLoading = false;
          this.user = response || {};
          this.orderDetails.fullName = this.user.name || '';
          this.orderDetails.address = this.user.address || { address: '', pincode: '', city: '', state: '' };
          this.orderDetails.contactNumber = this.user.contactNumber || '';
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  increaseQty(productId: number): void {
    const current = this.productQuantities[productId] || 1;
    if (current < 10) {
      this.productQuantities[productId] = current + 1;
    }
  }

  decreaseQty(productId: number): void {
    const current = this.productQuantities[productId] || 1;
    if (current > 1) {
      this.productQuantities[productId] = current - 1;
    }
  }

  placeOrder(form?: NgForm): void {
    const currentForm = form || this.orderForm;
    const formValues = currentForm ? currentForm.value : {};

    this.orderDetails.fullName = formValues.fullName || this.user.name || this.orderDetails.fullName;
    this.orderDetails.address = {
      address: formValues.address || this.orderDetails.address?.address,
      pincode: formValues.pincode || this.orderDetails.address?.pincode,
      city: formValues.city || this.orderDetails.address?.city,
      state: formValues.state || this.orderDetails.address?.state
    };
    this.orderDetails.contactNumber = formValues.contactNumber || this.orderDetails.contactNumber;
    this.orderDetails.orderQuantities = this.getQuntity();

    this.isSubmitting = true;

    this.productService.placeOrder(this.orderDetails, this.isSingleProductCheckout).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.userAuthService.setOrderPlaced(true);

        if (this.user.email) {
          this.EmailRequest.to = this.user.email.trim();
          this.EmailRequest.subject = 'Order Confirmation - BuyFurn';
          this.EmailRequest.text = `
Dear ${this.orderDetails.fullName},

Thank you for your order with BuyFurn! Your order has been successfully placed. We are preparing your order and will notify you once it is dispatched.

Estimated Delivery: 5-6 Working Days.

Thank you for shopping with us!

Best regards,
BuyFurn Team
`;
          this.emailService.sendMail(this.EmailRequest).subscribe();
        }

        this.router.navigate(['/orderplaced']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Place order error', error);
        Swal.fire({
          icon: 'error',
          title: 'Order Placement Failed',
          text: 'There was an issue processing your order. Please try again.',
          confirmButtonColor: '#cca038'
        });
      }
    });
  }

  getQuntity(): { productId: number; quantity: number }[] {
    return Object.keys(this.productQuantities).map(productId => {
      return { productId: Number(productId), quantity: this.productQuantities[Number(productId)] };
    });
  }

  getCalculateTotal(price: number, productId: number): number {
    const quantity = this.productQuantities[productId] || 1;
    return price * quantity;
  }

  calculateGrandTotal(): number {
    if (!this.products) return 0;
    return this.products.reduce((accumulator, product) => {
      const quantity = this.productQuantities[product.id] || 1;
      return accumulator + (product.price * quantity);
    }, 0);
  }

  createTransactionAndPlaceOrder(form?: NgForm): void {
    const currentForm = form || this.orderForm;
    if (currentForm && currentForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information',
        text: 'Please fill in all the required delivery details.',
        confirmButtonColor: '#cca038'
      });
      return;
    }

    const grandTotal = this.calculateGrandTotal();
    this.productService.createTransaction(grandTotal).subscribe({
      next: (response) => {
        this.openTransactionModel(response, currentForm);
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Payment Gateway Error',
          text: 'Could not initiate payment. Please try again.',
          confirmButtonColor: '#cca038'
        });
      }
    });
  }

  openTransactionModel(response: any, form?: NgForm): void {
    const currentForm = form || this.orderForm;
    const options = {
      order_id: response.orderId,
      key: response.key,
      amount: response.amount,
      currency: response.currency,
      name: 'BuyFurn',
      description: 'Furniture Purchase Checkout',
      image: 'assets/images/ByFurn.jpg',
      handler: (resp: any) => {
        if (resp.razorpay_payment_id && resp != null) {
          this.processResponse(resp, currentForm);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: 'Your payment was not completed.',
            confirmButtonColor: '#cca038'
          });
        }
      },
      prefill: {
        name: this.orderDetails.fullName || 'BuyFurn Customer',
        email: this.user.email || 'customer@buyfurn.com',
        contact: this.orderDetails.contactNumber || ''
      },
      notes: {
        address: this.orderDetails.address?.address || 'Online Furniture Order'
      },
      theme: {
        color: '#1e3a2b'
      }
    };

    const razorPayObject = new Razorpay(options);
    razorPayObject.open();
  }

  processResponse(resp: any, form?: NgForm): void {
    const currentForm = form || this.orderForm;
    this.orderDetails.transactionId = resp.razorpay_payment_id;
    this.placeOrder(currentForm);
  }
}
