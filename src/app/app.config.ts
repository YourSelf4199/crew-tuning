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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APOLLO_OPTIONS,
      useFactory: async (httpLink: HttpLink) => {
        // Get the current auth session
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString() || '';
        const userId = session.tokens?.idToken?.payload?.sub || '';

        const headers = new HttpHeaders({
          Authorization: `Bearer ${idToken}`,
          'X-Hasura-User-Id': userId,
          'Content-Type': 'application/json',
        });

        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: environment.hasuraUrl,
            headers,
          }),
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
      deps: [HttpLink],
    },
    Apollo,
    HttpLink,
  ],
};
