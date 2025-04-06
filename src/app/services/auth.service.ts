import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  signUp,
  confirmSignUp,
  signIn,
  fetchAuthSession,
  SignUpInput,
  signOut
} from 'aws-amplify/auth';
import { jwtDecode } from 'jwt-decode';

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
    return result;
  }

  /**
   * Confirm user's signup with code, then sign in and insert into Hasura
   */
  async confirmSignUp(username: string, code: string, password: string) {
    const confirmResult = await confirmSignUp({
      username,
      confirmationCode: code
    });
  
    // ✅ Clear previous session if exists
    await signOut();
  
    // ✅ Now sign in
    await signIn({ username, password });
  
    const token = await this.getIdToken();
    if (!token) throw new Error('Unable to get ID token');
  
    const decoded = jwtDecode<{ sub: string; email: string, name: string }>(token);
    console.log(decoded);
    
    const userId = decoded.sub;
    const email = decoded.email;
    const name = decoded.name;
  
    if (userId && email && name) {
      await this.insertUserIntoHasura(userId, email, name);
    }
  
    return confirmResult;
  }

  /**
   * Insert user into Hasura with GraphQL + Cognito ID token
   */
  private async insertUserIntoHasura(userId: string, email: string, name: string) {
    // 1. Define your GraphQL mutation as a string
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
  
    // 2. Prepare your variables (these are the values you're passing to the GraphQL mutation)
    const variables = {
      email: email,  // user email
      sub: userId,   // user sub (cognito sub)
      name: name     // user name
    };
  
    // 3. Structure the body of the request
    const body = {
      query: mutation,        // The GraphQL mutation query
      variables: variables    // The variables to insert into the mutation
    };
  
    // 4. Ensure the body is in JSON format
    console.log('GraphQL Request Body:', this.cleanGraphQLBody(body)); 
    console.log('GraphQL Request Body:', JSON.stringify(body));  // Log to verify the structure
  
    // 5. Prepare the Authorization header with the ID token
    const token = await this.getIdToken();
    if (!token) {
      throw new Error('Unable to get ID token');
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Hasura-User-Id': userId,  // Adding the sub as the user ID for Hasura
    });

    console.log(headers);    
  
    // 6. Send the request to Hasura using the HttpClient
    const hasuraUrl = 'https://immune-octopus-96.hasura.app/v1/graphql';
    try {
      const response = await this.http.post(hasuraUrl, body, { headers }).toPromise();
      console.log('✅ User inserted:', response);
      return response;
    } catch (error) {
      console.error('❌ Mutation failed:', error);
      throw error;
    }
  } 

  cleanGraphQLBody(body: any): any {
    // Clean up the query by removing unnecessary newlines and spaces
    const cleanedQuery = body.query.replace(/\s+/g, ' ').trim();
  
    // Return the cleaned body with the cleaned query and original variables
    return {
      ...body,
      query: cleanedQuery
    };
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
