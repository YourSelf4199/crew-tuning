import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SignupFormComponent } from '../../components/auth/signup-form/signup-form.component';
import { SigninFormComponent } from '../../components/auth/signin-form/signin-form.component';

@Component({
  selector: 'app-signinandsignup',
  imports: [CommonModule, SignupFormComponent, SigninFormComponent],
  templateUrl: './signinandsignup.component.html',
  styleUrl: './signinandsignup.component.css',
  standalone: true,
})
export class SigninandsignupComponent {
  showSignIn = true;

  constructor(private router: Router) {}

  onSwitchToLogin() {
    this.showSignIn = true;
  }

  onSwitchToSignup() {
    this.showSignIn = false;
  }
}
