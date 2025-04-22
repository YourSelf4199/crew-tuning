import { Injectable } from '@angular/core';
import {
  signUp,
  signIn,
  fetchAuthSession,
  SignUpInput,
  signOut,
  resetPassword,
  confirmResetPassword,
  updatePassword,
} from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isSigningOut = false;

  loading$ = this.loadingSubject.asObservable();

  constructor(private router: Router) {}

  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  /**
   * Sign in user with email and password
   */
  async signIn(email: string, password: string) {
    this.setLoading(true);
    try {
      await signIn({
        username: email,
        password,
      });
      await this.router.navigate(['/app/dashboard']);
    } catch (error: any) {
      console.error('Sign in failed:', error);
      throw new Error('Incorrect username or password. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, name: string) {
    this.setLoading(true);
    try {
      const input: SignUpInput = {
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      };
      console.log('SignUp input:', JSON.stringify(input, null, 2));
      const result = await signUp(input);
      console.log('SignUp result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error: any) {
      console.error('Sign up failed:', error);
      if (error.name === 'UsernameExistsException') {
        // If user already exists, redirect to app
        this.router.navigate(['/app']);
        return;
      }
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    this.setLoading(true);
    this.isSigningOut = true;
    try {
      await signOut();
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      this.setLoading(false);
      this.isSigningOut = false;
    }
  }

  // /**
  //  * Get current auth session
  //  */
  async getCurrentSession() {
    try {
      return await fetchAuthSession();
    } catch (error) {
      console.error('Failed to fetch session:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    this.setLoading(true);
    try {
      return await resetPassword({ username: email });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(email: string, code: string, newPassword: string) {
    this.setLoading(true);
    try {
      return await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update password
   */
  async updatePassword(oldPassword: string, newPassword: string) {
    this.setLoading(true);
    try {
      await updatePassword({
        oldPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Password update failed:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
}
