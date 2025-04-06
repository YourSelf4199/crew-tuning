import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  standalone: true
})
export class SignupComponent {
  email = '';
  password = '';
  code = '';
  name = '';

  codeSent = signal(false);
  message = signal('');

  constructor(private auth: AuthService) {}

  async handleSignUp() {
    try {
      await this.auth.signUp(this.email, this.password, this.email, this.name);
      this.codeSent.set(true);
      this.message.set('Signup successful. Please check your email for the confirmation code.');
    } catch (err: any) {
      this.message.set(err.message || 'Signup failed.');
    }
  }

  async handleConfirm() {
    try {
      // ✅ Pass password so AuthService can sign in and insert user
      await this.auth.confirmSignUp(this.email, this.code, this.password);
      this.message.set('Email confirmed. You can now log in.');
    } catch (err: any) {
      this.message.set(err.message || 'Confirmation failed.');
    }
  }
}
