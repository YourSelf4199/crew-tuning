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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink, router: Router) => {
        // Create an auth link that adds the token to requests
        const authLink = setContext(async (_, { headers }) => {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          const userId = session.tokens?.idToken?.payload?.sub;

          if (!token) {
            throw new Error('No authentication token available');
          }

          return {
            headers: {
              ...headers,
              Authorization: `Bearer ${token}`,
              'X-Hasura-User-Id': userId,
            },
          };
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

        // Create authenticated and unauthenticated HTTP links
        const authenticatedHttp = httpLink.create({
          uri: environment.hasuraUrl,
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        });

        const unauthenticatedHttp = httpLink.create({
          uri: environment.hasuraUrl,
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': environment.hasuraAdminSecret, // Use admin secret for unauthenticated operations
          }),
        });

        // Split the link based on operation type
        const splitLink = split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'mutation' &&
              definition.name?.value === 'CreateUser' // Only use unauthenticated link for CreateUser mutation
            );
          },
          unauthenticatedHttp,
          authLink.concat(authenticatedHttp),
        );

        return {
          cache: new InMemoryCache(),
          link: errorLink.concat(splitLink),
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
