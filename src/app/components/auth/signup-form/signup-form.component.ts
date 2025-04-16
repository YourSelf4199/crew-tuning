import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { SignUpOutput } from 'aws-amplify/auth';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css'],
})
export class SignupFormComponent {
  @Output() signupSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  signupForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const { email, password, name } = this.signupForm.value;
      try {
        // Sign up user in Cognito
        const signUpResult = await this.authService.signUp(email, password, name);

        if (!signUpResult.userId) {
          throw new Error('Failed to get Cognito user ID');
        }

        // Save user to Hasura
        await this.userService.saveUserToHasura(signUpResult.userId, email, name);

        this.signupSuccess.emit();
      } catch (error) {
        console.error('Signup failed:', error);
        // Handle error (show message to user)
      } finally {
        this.isLoading = false;
      }
    }
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}
