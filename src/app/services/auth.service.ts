import { HttpClient, HttpHeaders } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  hasuraUrl = 'https://immune-octopus-96.hasura.app/v1/graphql';

  constructor(private http: HttpClient) {}

  /**
   * Sign in user with Cognito
   */
  async signIn(email: string, password: string) {
    try {
      await signIn({
        username: email,
        password: password,
      });
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
      console.log('SignUp successful');
      return result;
    } catch (error) {
      console.error('Error signing up user:', error);
      throw new Error('Signup failed: ' + error);
    }
  }

  /**
   * Then sign in and insert into Hasura
   */
  async saveUser(email: string, name: string, password: string) {
    try {
      let sessionData = await fetchAuthSession();
      let idToken = sessionData.tokens?.idToken;

      if (!idToken) {
        console.warn('No ID token found, signing in...');
        await this.signIn(email, password);

        // 🔁 Try fetching session again after sign-in
        sessionData = await fetchAuthSession();
        idToken = sessionData.tokens?.idToken;

        if (!idToken) {
          throw new Error('ID token still missing after sign-in');
        }
      }

      const decoded = JSON.parse(atob(idToken.toString().split('.')[1]));
      console.log('Decoded ID Token:', decoded);

      const userId = decoded.sub;
      if (!userId) {
        throw new Error('No userId found in ID token');
      }

      console.log('User ID:', userId);
      await this.insertUserIntoHasura(userId, email, name);
    } catch (error) {
      console.error('❌ Error saving user:', error);
      throw new Error('Save user failed: ' + (error as any).message);
    }
  }

  /**
   * Insert user into Hasura with GraphQL + Cognito ID token
   */
  private async insertUserIntoHasura(userId: string, email: string, name: string) {
    const mutation = `
    mutation InsertUser($email: String!, $sub: String!, $name: String) {
        insert_users_one(
          object: { email: $email, cognito_sub: $sub, name: $name },
          on_conflict: {
            constraint: users_cognito_sub_key,
            update_columns: []
          }
        ) {
          id
        }
      }
    `;

    const variables = {
      email: email, // user email
      sub: userId, // user sub (cognito sub)
      name: name, // user name
    };

    const body = {
      query: mutation,
      variables: variables,
    };

    const token = await this.getIdToken();
    if (!token) {
      throw new Error('Unable to get ID token');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Hasura-User-Id': userId,
    });

    try {
      const response = await this.http
        .post(this.hasuraUrl, JSON.stringify(body), { headers })
        .toPromise();
      console.log('✅ User inserted:', response);
      return response;
    } catch (error) {
      console.error('❌ Mutation failed:', error);
      throw error;
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
    await signOut({ global: true });
  }

  /**
   * Get Cognito ID token for Hasura authorization
   */
  private async getIdToken(): Promise<string | null> {
    try {
      const sessionData = await fetchAuthSession();
      return sessionData.tokens?.idToken?.toString() ?? null;
    } catch (err) {
      console.error('Failed to get ID token:', err);
      return null;
    }
  }
}
