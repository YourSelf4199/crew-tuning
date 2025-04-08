import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signinandsignup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signinandsignup.component.html',
  styleUrl: './signinandsignup.component.css',
  standalone: true,
})
export class SigninandsignupComponent {
  authState: 'signup' | 'signin' | 'reset' | 'confirm' = 'signin'; // Default to sign in
  name = '';
  email = '';
  password = '';
  confirmPassword: string = '';
  code = '';
  confirmationCode = '';

  message = signal('');

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async handleSignUp() {
    try {
      await this.auth.signUp(this.email, this.password, this.email, this.name);
      await this.auth.saveUser(this.email, this.name, this.password);
      this.router.navigate(['/dashboard']);
      this.message.set('Signup successful. Please check your email for the confirmation code.');
    } catch (err: any) {
      this.message.set(err.message || 'Signup failed.');
    }
  }

  async handleSignIn() {
    try {
      await this.auth.signIn(this.email, this.password);
      await this.auth.saveUser(this.email, this.name, this.password);
      this.router.navigate(['/dashboard']);
      this.message.set('Signin successful. Please check your email for the confirmation code.');
    } catch (err: any) {
      this.message.set(err.message || 'Signup failed.');
    }
  }

  async handleForgotPassword() {
    try {
      await this.auth.forgotPassword(this.email);
      this.message.set('Signin successful. Please check your email for the confirmation code.');
      this.showPasswordReset();
    } catch (err: any) {
      this.message.set(err.message || 'Signup failed.');
    }
  }

  async handleResetPassword() {
    try {
      await this.auth.confirmPasswordReset(this.confirmationCode, this.email, this.password);
      this.message.set('Signin successful. Please check your email for the confirmation code.');
      this.showSignIn();
    } catch (err: any) {
      this.message.set(err.message || 'Signup failed.');
    }
  }

  // Show the SignUp form
  showSignUp() {
    this.authState = 'signup';
  }

  // Show the SignIn form
  showSignIn() {
    this.authState = 'signin';
  }

  // Show the Password Reset form
  showForgotPassword() {
    this.authState = 'reset';
  }

  showPasswordReset() {
    this.authState = 'confirm';
  }
}
