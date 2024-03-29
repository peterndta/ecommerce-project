import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopFormService {

  private countriesUrl = environment.shopApiUrl + '/countries'
  private stateUrl = environment.shopApiUrl +  '/states'

  constructor(private HttpClient: HttpClient) { }

  getCountries(): Observable<Country[]>{
    return this.HttpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    )
  }

  getStates(theCountryCode: string): Observable<State[]>{
    // search url
    const searchStateUrl = `${this.stateUrl}/search/findByCountryCode?code=${theCountryCode}`

    return this.HttpClient.get<GetResponseStates>(searchStateUrl).pipe(
      map(response => response._embedded.states)
    )
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {

    let data: number[] = []

    // build array cho Month dropdown list
    // bắt đầu từ tháng hiện tại rồi loop qua
    for(let theMonth = startMonth; theMonth <= 12; theMonth ++){
      data.push(theMonth)
    }

    return of(data)
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = []

    // build array years dropdown list
    // bắt đầu với năm hiện tại rồi loop qua 10 năm sau
    const startYear: number = new Date().getFullYear() // lấy năm hiện tại
    const endYear: number = startYear + 10

    for(let theYear = startYear; theYear <= endYear; theYear++){
      data.push(theYear)
    }

    return of(data)
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[];
  }
}