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
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
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
      return await signUp(input);
    } catch (error) {
      console.error('Sign up failed:', error);
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
    try {
      await signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get current auth session
   */
  async getCurrentSession() {
    this.setLoading(true);
    try {
      return await fetchAuthSession();
    } catch (error) {
      console.error('Failed to fetch session:', error);
      throw error;
    } finally {
      this.setLoading(false);
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
