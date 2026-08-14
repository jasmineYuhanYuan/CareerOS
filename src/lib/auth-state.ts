import type { Session } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null;
  isLoading: boolean;
}

export type AuthStateAction =
  | { type: "RESTORED"; session: Session | null }
  | { type: "CHANGED"; session: Session | null }
  | { type: "SIGNED_OUT" };

export const initialAuthState: AuthState = { session: null, isLoading: true };

export function authStateReducer(_state: AuthState, action: AuthStateAction): AuthState {
  if (action.type === "SIGNED_OUT") return { session: null, isLoading: false };
  return { session: action.session, isLoading: false };
}
