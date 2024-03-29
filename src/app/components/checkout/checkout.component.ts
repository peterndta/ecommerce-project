import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShopFormService } from '../../services/shop-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { Luv2ShopValidators } from '../../validators/luv2-shop-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { Router } from '@angular/router';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit{
  isAuthenticated: boolean = false

  checkoutFormGroup!: FormGroup

  totalPrice: number = 0
  totalQuantity: number = 0

  creditCardYears: number[] = []
  creditCardMonths: number[] = []

  countries: Country[] = []
  
  shippingAddressStates: State[] = []
  billingAddressStates: State[] = []

  storage: Storage = sessionStorage

  localStorage: Storage = localStorage

  constructor(private formBuilder: FormBuilder,
              private shopService: ShopFormService, 
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router,
              private oktaAuthService: OktaAuthStateService,
              @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.oktaAuthService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated!
      }
    )

    this.reviewCartDetails()

    // lấy user email trog storage
    const email = JSON.parse(this.storage.getItem('userEmail')!)

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl(email, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: [''],
      }),
    })

    // Lấy credit card months hiện tại
    const startMonth: number = new Date().getMonth() + 1

    this.shopService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data
      }
    )
    
    // Lấy credit card years hiện tại
    this.shopService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data
      }
    )

    // Lấy countries
    this.shopService.getCountries().subscribe(
      data => {
        this.countries = data
      }
    )
  }

  reviewCartDetails() {
    //subscribe cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    )

    //subscribe cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    )
  }

  onSubmit(){
    
    if(this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched()
      return;
    }

    // set up order
    let order = new Order()
    order.totalPrice = this.totalPrice
    order.totalQuantity = this.totalQuantity

    // get cart items
    const cartItems = this.cartService.cartItems

    // Tạo orderItems từ cartItems
    // Cách 1: Dài
    // let orderItems: OrderItem[] = []
    // for (let index = 0; index < cartItems.length; index++) {
    //   orderItems[index] = new OrderItem(cartItems[index])
    // }

    // Cách 2: Ngắn
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem))

    // set up purchase
    let purchase = new Purchase()

    // điền customer vô purchase
    purchase.customer = this.checkoutFormGroup.controls['customer'].value

    // điền shipping address vô purchase
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state))
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country))
    purchase.shippingAddress.state = shippingState.name
    purchase.shippingAddress.country = shippingCountry.name

    // điền billing address vô purchase
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state))
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country))
    purchase.billingAddress.state = billingState.name
    purchase.billingAddress.country = billingCountry.name

    // điền orderItems vô purchase
    purchase.order = order
    purchase.orderItems = orderItems
    console.log(orderItems)
    console.log(purchase)
    // gọi REST API thông qua CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
        next: response => {
          alert(`Your order has been received. \nOrder tracking number: ${response.orderTrackingNumber}`)

          // reset cart
          this.resetCart()

          // clear localStorage for cart
          localStorage.removeItem('cartItems')

        },
        error: err => {
          alert(`There was an error: ${err.message}`)
        }
      }
    )
  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = []
    this.cartService.totalPrice.next(0)
    this.cartService.totalQuantity.next(0)

    // reset form
    this.checkoutFormGroup.reset()

    // navigate về product page
    this.router.navigateByUrl("/products")
  }

  // getter customer
  get firstName(){
    return this.checkoutFormGroup.get('customer.firstName')
  }
  get lastName(){
    return this.checkoutFormGroup.get('customer.lastName')
  }
  get email(){
    return this.checkoutFormGroup.get('customer.email')
  }

  // getter shipping address
  get shippingAddressStreet(){
    return this.checkoutFormGroup.get('shippingAddress.street')
  }
  get shippingAddressCity(){
    return this.checkoutFormGroup.get('shippingAddress.city')
  }
  get shippingAddressState(){
    return this.checkoutFormGroup.get('shippingAddress.state')
  }
  get shippingAddressZipCode(){
    return this.checkoutFormGroup.get('shippingAddress.zipCode')
  }
  get shippingAddressCountry(){
    return this.checkoutFormGroup.get('shippingAddress.country')
  }

  // getter billing address
  get billingAddressStreet(){
    return this.checkoutFormGroup.get('billingAddress.street')
  }
  get billingAddressCity(){
    return this.checkoutFormGroup.get('billingAddress.city')
  }
  get billingAddressState(){
    return this.checkoutFormGroup.get('billingAddress.state')
  }
  get billingAddressZipCode(){
    return this.checkoutFormGroup.get('billingAddress.zipCode')
  }
  get billingAddressCountry(){
    return this.checkoutFormGroup.get('billingAddress.country')
  }
  
  // getter billing address
  get creditCardType(){
    return this.checkoutFormGroup.get('creditCard.cardType')
  }
  get creditCardNameOnCard(){
    return this.checkoutFormGroup.get('creditCard.nameOnCard')
  }
  get creditCardNumber(){
    return this.checkoutFormGroup.get('creditCard.cardNumber')
  }
  get creditCardSecurityCode(){
    return this.checkoutFormGroup.get('creditCard.securityCode')
  }

  copyShippingAddressToBillingAddress(event: any){

    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value)
      
      // copy state từ shippingAddress cho billingAddress
      this.billingAddressStates = this.shippingAddressStates

    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset()

      // clear billingAddressStates
      this.billingAddressStates = []
    }

  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard')

    const currentYear: number = new Date().getFullYear()
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear)

    // check current year trùng với year được user chọn thì chỉ lấy từ tháng hiện tại trở đi
    let startMonth: number

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1
    } else {
      startMonth = 1
    }

    this.shopService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data
      }
    )
  }

  getStates(formGroupName: string) {
    // check để lấy country đúng với form group đang click
    const formGroup = this.checkoutFormGroup.get(formGroupName)

    const countryCode = formGroup?.value.country.code

    this.shopService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data
        } else {
          this.billingAddressStates = data
        }

        // chọn state đầu tiên là default
        formGroup?.get('state')?.setValue(data[0])
      }
    )
  }
}
