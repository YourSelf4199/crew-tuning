import { Handler, PostConfirmationTriggerEvent } from 'aws-lambda';
import fetch from 'node-fetch';

const HASURA_ENDPOINT = 'https://immune-octopus-96.hasura.app/v1/graphql';

const INSERT_USER = `
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

export const handler: Handler<PostConfirmationTriggerEvent> = async (event) => {
  try {
    console.log('Post-confirmation trigger started');
    console.log('Event:', JSON.stringify(event, null, 2));

    const { userAttributes } = event.request;
    const { sub, email, name } = userAttributes;

    console.log('User attributes:', { sub, email, name });

    const requestBody = {
      query: INSERT_USER,
      variables: {
        email,
        sub,
        name: name || null,
      },
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(HASURA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': 'nCDHRbIT56z3r837yvTHXVlbcO30TvkyPFMj9PrK7m0L3LdSJY7c90Fa07bhdVKo',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      throw new Error(`Hasura request failed: ${response.statusText}`);
    }

    return event;
  } catch (error) {
    console.error('Error in post-confirmation trigger:', error);
    throw error;
  }
};
