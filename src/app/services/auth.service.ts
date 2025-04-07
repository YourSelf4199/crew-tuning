import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  signUp,
  signIn,
  fetchAuthSession,
  SignUpInput,
} from 'aws-amplify/auth';

interface IdTokenPayload {
  sub: string;
  email: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

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
          name
        }
      }
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
    const sessionData = await fetchAuthSession();
    const idToken = sessionData.tokens?.idToken;

    if (idToken) {
      // Decode JWT (pure TypeScript - no extra library)
      const decoded = JSON.parse(atob(idToken.toString().split('.')[1]));
      console.log('Decoded ID Token:', decoded);

      const userId = sessionData.tokens?.idToken?.payload.sub?.toString();

      if (userId) {
        console.log('User ID:', userId);
        await this.insertUserIntoHasura(userId, email, name);
      } else {
        console.error('No userId found in ID token');
      }
    } else {
      console.error('No ID token found in session');
      await signIn({
        username: email,
        password: password,
      })
      this.saveUser(email, name, password);
    }
  } catch (error) {
    console.error('Error saving user:', error);
    throw new Error('Save user failed: ' + error);
  }
}

  /**
   * Insert user into Hasura with GraphQL + Cognito ID token
   */
  private async insertUserIntoHasura(userId: string, email: string, name: string) {
    console.log('Building Mutaion');
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
      email: email,  // user email
      sub: userId,   // user sub (cognito sub)
      name: name     // user name
    };

    const body = {
      query: mutation,
      variables: variables
    };

    const token = await this.getIdToken();
    if (!token) {
      throw new Error('Unable to get ID token');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Hasura-User-Id': userId,
    });

    const hasuraUrl = 'https://immune-octopus-96.hasura.app/v1/graphql';
    try {
      const response = await this.http.post(hasuraUrl, JSON.stringify(body), { headers }).toPromise();
      console.log('✅ User inserted:', response);      
      return response;
    } catch (error) {
      console.error('❌ Mutation failed:', error);
      throw error;
    }
  }

  //const hasuraUrl = 'https://immune-octopus-96.hasura.app/v1/graphql';

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
