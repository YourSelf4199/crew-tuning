import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  EmailValidatorDirective,
  PasswordValidatorDirective,
} from '../../../directives/validators';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PasswordResetComponent {
  @Output() switchToLogin = new EventEmitter<void>();

  emailForm: FormGroup;
  resetForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isCodeSent = false;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private emailValidator: EmailValidatorDirective,
    private passwordValidator: PasswordValidatorDirective,
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator.validate.bind(this.emailValidator)]],
    });

    this.resetForm = this.fb.group(
      {
        code: ['', Validators.required],
        newPassword: [
          '',
          [Validators.required, this.passwordValidator.validate.bind(this.passwordValidator)],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  async onRequestCode() {
    if (this.emailForm.valid) {
      this.errorMessage = null;
      this.successMessage = null;
      const { email } = this.emailForm.value;

      try {
        await this.authService.resetPassword(email);
        this.isCodeSent = true;
        this.successMessage = 'Reset code sent to your email. Please check your inbox.';
        // Clear the email form but keep the email value for the reset form
        this.emailForm.reset({ email });
      } catch (error: any) {
        console.error('Password reset request failed:', error);
        this.errorMessage = error.message || 'Failed to send reset code. Please try again.';
      }
    }
  }

  async onResetPassword() {
    if (this.resetForm.valid) {
      this.errorMessage = null;
      const { code, newPassword } = this.resetForm.value;
      const email = this.emailForm.value.email;

      try {
        await this.authService.confirmPasswordReset(email, code, newPassword);
        this.successMessage =
          'Password reset successful. You can now sign in with your new password.';
        setTimeout(() => {
          this.switchToLogin.emit();
        }, 2000);
      } catch (error: any) {
        console.error('Password reset failed:', error);
        this.errorMessage = error.message || 'Failed to reset password. Please try again.';
      }
    }
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}
