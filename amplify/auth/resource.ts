import { defineAuth } from '@aws-amplify/backend';
import { preTokenGeneration } from '../functions/pre-token-generation/resource';
import { preSignUp } from '../functions/pre-sign-up/resource';
import { postConfirmation } from '../functions/post-confirmation/resource';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  triggers: {
    preTokenGeneration,
    preSignUp,
    postConfirmation,
  },
  accountRecovery: 'EMAIL_ONLY',
});
