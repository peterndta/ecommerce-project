import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  // templateUrl: './product-list.component.html',
  // templateUrl: './product-list-table.component.html',
  templateUrl: './product-list-grid.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // properties cho pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  // properties pagination cho search để khi search từ mới thì quay về trag 1
  previousKeyword: string = "";


  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    })
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword')
    // check nếu có keyword trên params nghĩa là đang search -> gọi handleSearchProduct()
    if(this.searchMode){
      this.handleSearchProducts()
    } else {
      this.handleListProducts()
    }
  }

  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    // nếu search từ mới thì set thePageNumber về 1 chứ không thì search từ mới nhưng vẫn bị lưu số trag cũ
    if(this.previousKeyword != theKeyword){
      this.thePageNumber = 1
    }

    this.previousKeyword = theKeyword;

    // search product với keyword vừa tìm
    this.productService.searchProductListPaginate(this.thePageNumber - 1,
                                                  this.thePageSize,
                                                  theKeyword).subscribe(this.processResult())
  }

  handleListProducts(){
    // check if id parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id')

    if(hasCategoryId){
      // get the "id" param string, và convert string thành number với + symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!; // dấu ! để báo cho compiler object không null
    } else {
      // không có cate id thi default cate sẽ là 1
      this.currentCategoryId = 1;
    }

    // check nếu category id hiện tại khác category trước đó thì reset thePageNumber về 1, để mỗi khi đổi cate thì back về trag đầu
    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber = 1
    }

    this.previousCategoryId = this.currentCategoryId

    // lấy products cho cate id tương ứng
    this.productService.getProductListPaginate(this.thePageNumber - 1,
                                               this.thePageSize,
                                               this.currentCategoryId).subscribe(this.processResult())
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCart(theProduct: Product) {
    const theCartItem = new CartItem(theProduct)

    this.cartService.addToCart(theCartItem)
  }
}
