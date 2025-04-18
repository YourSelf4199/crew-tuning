import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { fetchAuthSession } from 'aws-amplify/auth';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Router } from '@angular/router';
import { split } from '@apollo/client/link/core';
import { getMainDefinition } from '@apollo/client/utilities';
import {
  EmailValidatorDirective,
  NameValidatorDirective,
  PasswordValidatorDirective,
} from './directives/validators';

interface HasuraClaims {
  'X-Hasura-User-Id': string;
  'x-hasura-allowed-roles': string[];
  'x-hasura-default-role': string;
}

interface TokenPayload {
  sub: string;
  'https://hasura.io/jwt/claims': HasuraClaims;
  [key: string]: any;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    EmailValidatorDirective,
    NameValidatorDirective,
    PasswordValidatorDirective,
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink, router: Router) => {
        // Create an auth link that adds the token to requests
        const authLink = setContext(async (_, { headers }) => {
          try {
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();
            const userId = session.tokens?.idToken?.payload?.sub;
            const tokenPayload = session.tokens?.idToken?.payload as TokenPayload;

            if (!token || !userId) {
              console.warn('No valid authentication token available');
              return null; // This will prevent the request from being made
            }

            // Verify the token has the required claims
            if (!tokenPayload?.['https://hasura.io/jwt/claims']?.['X-Hasura-User-Id']) {
              console.warn('Token missing required Hasura claims');
              return null;
            }

            return {
              headers: {
                ...headers,
                Authorization: `Bearer ${token}`,
                'X-Hasura-User-Id': userId,
              },
            };
          } catch (error) {
            console.warn('Error getting auth session:', error);
            return null; // Prevent request on any auth error
          }
        });

        // Create an error link to handle authentication errors
        const errorLink = onError(({ graphQLErrors, networkError }) => {
          if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path }) => {
              console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
              );
              // If we get an authentication error, redirect to login
              if (message.includes('Unauthorized') || message.includes('authentication')) {
                router.navigate(['/']);
              }
            });
          }
          if (networkError) {
            console.error(`[Network error]: ${networkError}`);
            if (networkError.message.includes('401')) {
              router.navigate(['/']);
            }
          }
        });

        // Create authenticated HTTP link
        const http = httpLink.create({
          uri: environment.hasuraUrl,
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        });

        return {
          cache: new InMemoryCache(),
          link: errorLink.concat(authLink).concat(http),
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'network-only',
              errorPolicy: 'all',
            },
            query: {
              fetchPolicy: 'network-only',
              errorPolicy: 'all',
            },
            mutate: {
              errorPolicy: 'all',
            },
          },
        };
      },
      deps: [HttpLink, Router],
    },
    Apollo,
    HttpLink,
  ],
};
