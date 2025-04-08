import { createReducer, on } from '@ngrx/store';
import { setAuthSession, clearAuthSession } from './auth.actions';

export interface AuthState {
  idToken: string;
  userId: string;
  // Other properties as needed (e.g., user name, email)
}

const initialState: AuthState = {
  idToken: '',
  userId: '',
  // Initialize other properties if needed
};

export const authReducer = createReducer(
  initialState,
  on(setAuthSession, (state, { idToken, userId }) => ({
    ...state,
    idToken,
    userId,
  })),
);
