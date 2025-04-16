import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-form',
  templateUrl: './signin-form.component.html',
  styleUrls: ['./signin-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class SigninFormComponent {
  @Output() switchToSignup = new EventEmitter<void>();

  signinForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    if (this.signinForm.valid) {
      this.errorMessage = null;
      const { email, password } = this.signinForm.value;

      try {
        await this.authService.signIn(email, password);
        this.router.navigate(['/app']);
      } catch (error: any) {
        console.error('Sign in failed:', error);
        this.errorMessage = error.message || 'An error occurred during sign in. Please try again.';
      }
    }
  }

  onSwitchToSignup() {
    this.switchToSignup.emit();
  }
}
