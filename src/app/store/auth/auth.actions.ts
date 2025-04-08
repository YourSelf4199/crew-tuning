// auth.actions.ts
import { createAction, props } from '@ngrx/store';

export const setAuthSession = createAction(
  '[Auth] Set Auth Session',
  props<{ idToken: string; userId: string }>(),
);

export const clearAuthSession = createAction('[Auth] Clear Session');
