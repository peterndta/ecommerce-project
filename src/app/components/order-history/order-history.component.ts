import { Component, OnInit } from '@angular/core';
import { OrderHistory } from '../../common/order-history';
import { OrderHistoryService } from '../../services/order-history.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  orderHistoryList: OrderHistory[] = []
  storage: Storage = sessionStorage

  constructor(private orderHistoryService: OrderHistoryService) {}

  ngOnInit(): void {
    this.handleOrderHistory()
  }

  handleOrderHistory() {
    // lấy user email từ storage
    const email = JSON.parse(this.storage.getItem('userEmail')!)

    // lấy data từ service
    this.orderHistoryService.getOrderHistory(email).subscribe(
      data => {
        this.orderHistoryList = data._embedded.orders
      }
    )
  }

}
