export interface HasuraClaims {
  'X-Hasura-User-Id': string;
  'x-hasura-allowed-roles': string[];
  'x-hasura-default-role': string;
}

export interface TokenPayload {
  sub: string;
  'https://hasura.io/jwt/claims': HasuraClaims;
  [key: string]: any;
}
