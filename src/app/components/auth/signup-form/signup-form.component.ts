import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class SignupFormComponent {
  @Output() signupSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  signupForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        name: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.signupForm.valid) {
      this.errorMessage = null;
      const { email, password, name } = this.signupForm.value;

      try {
        // First create Cognito user
        const signUpResult = await this.authService.signUp(email, password, name);

        if (!signUpResult?.userId) {
          throw new Error('Failed to get Cognito user ID');
        }

        // Then save to Hasura
        await this.userService.saveUserToHasura(signUpResult.userId, email, name);

        // Navigate to the sidebar
        this.router.navigate(['/app']);
      } catch (error) {
        console.error('Signup failed:', error);
        this.errorMessage = 'Failed to create account. Please try again.';
      }
    }
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}
