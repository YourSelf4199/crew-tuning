import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthStateFull } from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class DatabaseQueriesService {
  private readonly hasuraUrl = 'https://immune-octopus-96.hasura.app/v1/graphql';

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  /**
   * Insert user into Hasura with GraphQL + Cognito ID token
   */
  async insertUserIntoHasura(userId: string, email: string, name: string) {
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
      email: email,
      sub: userId,
      name: name,
    };

    const body = {
      query: mutation,
      variables: variables,
    };

    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
      'X-Hasura-User-Id': authState().userId,
    });

    try {
      await this.http.post(this.hasuraUrl, JSON.stringify(body), { headers });
    } catch (error) {
      console.error('❌ Mutation failed:', error);
      throw error;
    }
  }
}
