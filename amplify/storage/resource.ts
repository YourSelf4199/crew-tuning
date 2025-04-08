import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'carAssets',
  access: (allow) => ({
    'cars/*': [allow.authenticated.to(['read'])],
  }),
});
