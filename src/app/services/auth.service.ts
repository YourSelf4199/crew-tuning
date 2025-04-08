import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
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
import { setAuthSession } from '../store/auth/auth.actions';
import { selectIdToken, selectUserId } from '../store/auth/auth.selectors';
import { DatabaseQueriesService } from './database-queries.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private store: Store,
    private databaseBase: DatabaseQueriesService,
  ) {}

  /**
   * Sign in user with Cognito
   */
  async signIn(email: string, password: string) {
    try {
      await signIn({
        username: email,
        password: password,
      });

      await this.setIdToken();
    } catch (error) {
      console.error('Error signing in user:', error);
      throw new Error('Signin failed: ' + error);
    }
  }

  /**
   * Sign up user with Cognito
   */
  async signUp(username: string, password: string, email: string, name: string) {
    try {
      const input: SignUpInput = {
        username,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      };

      const result = await signUp(input);
      return result;
    } catch (error) {
      throw new Error('Signup failed: ' + error);
    }
  }

  /**
   * Then sign in and insert into Hasura
   */
  async saveUser(email: string, name: string, password: string) {
    try {
      let idToken = this.store.select(selectIdToken);

      if (!idToken) {
        await this.signIn(email, password);
        await this.setIdToken();
        idToken = this.store.select(selectIdToken);

        if (!idToken) {
          throw new Error('ID token still missing after sign-in');
        }
      }

      const decoded = JSON.parse(atob(idToken.toString().split('.')[1]));
      console.log('Decoded ID Token:', decoded);

      const userId = this.store.select(selectUserId);
      if (!userId) {
        throw new Error('No userId found in ID token');
      }

      await this.databaseBase.insertUserIntoHasura(userId.toString(), email, name);
    } catch (error) {
      throw new Error('Save user failed: ' + (error as any).message);
    }
  }

  async forgotPassword(email: string) {
    const output = await resetPassword({
      username: email,
    });

    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(`Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`);
        // Collect the confirmation code from the user and pass to confirmResetPassword.
        break;
      case 'DONE':
        console.log('Successfully reset password.');
        break;
    }
  }

  async confirmPasswordReset(confirmationCode: string, email: string, newPassword: string) {
    await confirmResetPassword({
      username: email,
      confirmationCode: confirmationCode,
      newPassword: newPassword,
    });
  }

  async updatePassword(oldPassword: string, newPassword: string) {
    await updatePassword({
      oldPassword: oldPassword,
      newPassword: newPassword,
    });
  }

  async signOut() {
    // Clear any local storage or session storage data
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ global: true });
  }

  /**
   * Set Cognito ID token for Hasura authorization
   */
  private async setIdToken() {
    try {
      const sessionData = await fetchAuthSession();
      const idToken = sessionData?.tokens?.idToken?.toString();
      if (!idToken) {
        throw new Error('ID Token is missing');
      }

      this.store.dispatch(
        setAuthSession({
          idToken: idToken,
          userId: sessionData?.userSub ?? '',
        }),
      );
    } catch (err) {
      console.error('Failed to set ID token:', err);
    }
  }
}
