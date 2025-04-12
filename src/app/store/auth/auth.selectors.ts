// auth.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// Feature selector to select the auth state
export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthStateFull = selectAuthState;

// Selectors for specific properties in the auth state
export const selectIdToken = createSelector(
  selectAuthStateFull,
  (state: AuthState) => state.idToken,
);

export const selectUserId = createSelector(selectAuthStateFull, (state: AuthState) => state.userId);
