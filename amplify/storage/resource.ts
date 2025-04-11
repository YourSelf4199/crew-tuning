import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'vehicleAssets',
  access: (allow) => ({
    'vehicles/street-race/*': [allow.authenticated.to(['read'])],
    'vehicles/off-road/*': [allow.authenticated.to(['read'])],
    'vehicles/freestyle/*': [allow.authenticated.to(['read'])],
    'vehicles/pro-racing/*': [allow.authenticated.to(['read'])],
  }),
});
