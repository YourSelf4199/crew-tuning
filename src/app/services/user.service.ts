import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apollo: Apollo) {}

  /**
   * Save user to Hasura database
   */
  async saveUserToHasura(userId: string, email: string, name: string) {
    const SAVE_USER = gql`
      mutation CreateUser($email: String!, $sub: String!, $name: String) {
        insert_users_one(
          object: { email: $email, cognito_sub: $sub, name: $name }
          on_conflict: { constraint: users_cognito_sub_key, update_columns: [] }
        ) {
          cognito_sub
          email
          name
        }
      }
    `;

    try {
      await this.apollo
        .mutate({
          mutation: SAVE_USER,
          variables: {
            email,
            sub: userId,
            name,
          },
        })
        .toPromise();
    } catch (error) {
      console.error('Failed to save user to Hasura:', error);
      throw error;
    }
  }
}
