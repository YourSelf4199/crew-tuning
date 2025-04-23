import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SignupFormComponent } from '../../components/auth/signup-form/signup-form.component';
import { SigninFormComponent } from '../../components/auth/signin-form/signin-form.component';
import { PasswordResetComponent } from '../../components/auth/password-reset/password-reset.component';

@Component({
  selector: 'app-signinandsignup',
  imports: [CommonModule, SignupFormComponent, SigninFormComponent, PasswordResetComponent],
  templateUrl: './signinandsignup.component.html',
  styleUrl: './signinandsignup.component.css',
  standalone: true,
})
export class SigninandsignupComponent {
  showSignIn = true;
  showSignUp = false;
  showPasswordReset = false;

  constructor() {}

  onSwitchToLogin() {
    this.showSignIn = true;
    this.showSignUp = false;
    this.showPasswordReset = false;
  }

  onSwitchToSignup() {
    this.showSignIn = false;
    this.showSignUp = true;
    this.showPasswordReset = false;
  }

  onSwitchToPasswordReset() {
    this.showSignIn = false;
    this.showSignUp = false;
    this.showPasswordReset = true;
  }
}
