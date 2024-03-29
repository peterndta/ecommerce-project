import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css'
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean = false
  userFullName: string = ''

  storage: Storage = sessionStorage

  constructor(private oktaAuthService: OktaAuthStateService,
              @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.oktaAuthService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated!
        this.getUserDetails()
      }
    )
  }

  getUserDetails() {
    if(this.isAuthenticated) {
      // Fetch logged in user details
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name as string

          // lấy user email từ authentication response (sau khi login)
          const email = res.email

          // lưu vào storage
          this.storage.setItem('userEmail', JSON.stringify(email))
        }
      )
    }
  }

  logout() {
    // Terminate session with Okta và remove current tokens
    this.oktaAuth.signOut()
  }

}
