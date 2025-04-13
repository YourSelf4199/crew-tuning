import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { authReducer } from './store/auth/auth.reducer';
import { LocalStorageConfig, localStorageSync } from 'ngrx-store-localstorage';
import { provideEffects } from '@ngrx/effects';
import { VehicleEffects } from './store/vehicles/vehicles.effects';
import { vehicleReducer } from './store/vehicles/vehicles.reducer';

export function localStorageSyncConfig(): LocalStorageConfig {
  return {
    keys: ['auth', 'vehicle'],
    rehydrate: true,
    checkStorageAvailability: true,
  };
}
export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync(localStorageSyncConfig())(reducer);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore(
      {
        auth: authReducer,
        vehicle: vehicleReducer,
      },
      {
        metaReducers: [localStorageSyncReducer], // Apply the metaReducer to sync with localStorage
      },
    ),
    provideEffects([VehicleEffects]),
  ],
};
