import type { Handler, PreSignUpTriggerEvent } from 'aws-lambda';

export const handler: Handler<PreSignUpTriggerEvent> = async (event) => {
  // ✅ Automatically confirm the user
  event.response.autoConfirmUser = true;

  // ✅ Automatically verify email if present
  if ('email' in event.request.userAttributes) {
    event.response.autoVerifyEmail = true;
    event.response.autoConfirmUser = true;
  }

  // ✅ Return modified event back to Cognito
  return event;
};
