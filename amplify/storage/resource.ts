import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'vehicleAssets',
  access: (allow) => ({
    'street-race/*': [allow.authenticated.to(['read'])],
    'off-road/*': [allow.authenticated.to(['read'])],
    'freestyle/*': [allow.authenticated.to(['read'])],
    'pro-racing/*': [allow.authenticated.to(['read'])],
  }),
});
