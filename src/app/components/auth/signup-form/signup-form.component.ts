import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  EmailValidatorDirective,
  NameValidatorDirective,
  PasswordValidatorDirective,
} from '../../../directives/validators';
import { LoadingButtonComponent } from '../../loading-button/loading-button.component';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingButtonComponent],
})
export class SignupFormComponent {
  @Output() signupSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  signupForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private emailValidator: EmailValidatorDirective,
    private nameValidator: NameValidatorDirective,
    private passwordValidator: PasswordValidatorDirective,
  ) {
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, this.emailValidator.validate.bind(this.emailValidator)]],
        password: [
          '',
          [Validators.required, this.passwordValidator.validate.bind(this.passwordValidator)],
        ],
        confirmPassword: ['', [Validators.required]],
        name: ['', [Validators.required, this.nameValidator.validate.bind(this.nameValidator)]],
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
        await this.authService.signUp(email, password, name);
        this.signupSuccess.emit();
        this.router.navigate(['/app']);
      } catch (error: any) {
        console.error('Sign up failed:', error);
        this.errorMessage = error.message || 'An error occurred during sign up. Please try again.';
      }
    }
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}
