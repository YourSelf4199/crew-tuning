import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SignupFormComponent } from '../../components/auth/signup-form/signup-form.component';

@Component({
  selector: 'app-signinandsignup',
  imports: [CommonModule, SignupFormComponent],
  templateUrl: './signinandsignup.component.html',
  styleUrl: './signinandsignup.component.css',
  standalone: true,
})
export class SigninandsignupComponent {
  constructor(private router: Router) {}

  onSignupSuccess() {
    this.router.navigate(['/dashboard']);
  }

  onSwitchToLogin() {
    // Handle switching to login view if needed
    console.log('Switching to login view');
  }
}
