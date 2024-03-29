import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = []

  totalPrice: Subject<number> = new BehaviorSubject<number>(0)
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0)

  // storage: Storage = sessionStorage
  storage: Storage = localStorage

  constructor() { 
    // read data from storage
    let data = JSON.parse(this.storage.getItem('cartItems')!)

    if (data != null){
      this.cartItems = data
      
      // tính total dựa trên data dc đọc từ storage
      this.computeCartTotals()
    }
  }

  addToCart(theCartItem: CartItem){
    // check xem có item trong cart chưa
    let alreadyExistsInCart: boolean = false;
    // @ts-ignore
    let existingCartItem: CartItem = undefined;
    
    if(this.cartItems.length > 0){
      // tìm item có trong cart dựa trên item id
      // for(let tempCartItem of this.cartItems){
      //   if(tempCartItem.id === theCartItem.id){
      //     existingCartItem = tempCartItem;
      //     break;
      //   }
      // }
      // @ts-ignore
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id)

      // check có tìm thấy item không
      alreadyExistsInCart = (existingCartItem != undefined)
    }

    if(alreadyExistsInCart) {
      // tăng quantity sản phẩm lên
      existingCartItem.quantity++
    } else {
      // add thêm item vào mảng
      this.cartItems.push(theCartItem)
    }

    // Tính total price và quantity
    this.computeCartTotals()
  }

  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems))
  }

  computeCartTotals() {
    let totalPriceValue: number = 0
    let totalQuantityValue: number = 0

    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice
      totalQuantityValue += currentCartItem.quantity
    }

    // publish/send value mới cho tất cả subscriber
    this.totalPrice.next(totalPriceValue)
    this.totalQuantity.next(totalQuantityValue)

    // lưu cart items vào sessionStorage
    this.persistCartItems()
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--

    if (theCartItem.quantity ===0) {
      this.remove(theCartItem)
    } else {
      this.computeCartTotals()
    }
  }

  remove(theCartItem: CartItem) {
    // get index của item trog array
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id)

    // if tìm dc thì remove item
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1)

      this.computeCartTotals()
    }
  }
}
