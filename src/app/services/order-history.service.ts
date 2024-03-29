import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private orderUrl = environment.shopApiUrl +  '/orders'

  constructor(private httpClient: HttpClient) { }

  getOrderHistory(email: string): Observable<GetResponseOrderHistory>{
    // build URL dựa trên customer email
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${email}`

    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl)
  }
}

interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[];
  },
}
