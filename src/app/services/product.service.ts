import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = environment.shopApiUrl +  '/products'

  private categoryUrl = environment.shopApiUrl +  '/product-category'

  constructor(private httpClient: HttpClient) { }


  getProductListPaginate(thePage: number, thePageSize: number,theCategoryId: number): Observable<GetResponseProducts> {

    // build URL dựa trên category id, page, pageSize
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
                      + `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductList(theCategoryId: number): Observable<Product[]> {

    // build URL dựa trên category id 
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`

    return this.getProducts(searchUrl);
  }

  searchProductListPaginate(thePage: number, thePageSize: number,theKeyword: string): Observable<GetResponseProducts> {

    // build URL dựa trên category id, page, pageSize
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
                      + `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  searchProducts(theKeyword: string): Observable<Product[]> {
    // search product dựa trên keyword params trên URL lấy được
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
    
    return this.getProducts(searchUrl);
  }

  // get product dựa trên URL truyền vào
  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  // get product categories list cho sidebar
  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  getProduct(theProductId: number): Observable<Product> {
    // build URL dựa trên product id
    const productUrl = `${this.baseUrl}/${theProductId}`

    return this.httpClient.get<Product>(productUrl)
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}
