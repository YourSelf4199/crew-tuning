import type { PreTokenGenerationTriggerEvent, Handler } from 'aws-lambda';

export const handler: Handler<PreTokenGenerationTriggerEvent> = async (event) => {
  const sub = event.request.userAttributes.sub;

  // Prepare the claims to be added
  const claims = {
    "x-hasura-default-role": "user",
    "x-hasura-allowed-roles": ["user"],
    "x-hasura-user-id": sub,
  };

  // Log the claims to ensure they are correct
  console.log('Claims being added:', JSON.stringify(claims));

  // Set the claims to the response
  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        "https://hasura.io/jwt/claims": JSON.stringify(claims),
      },
    },
  };

  return event;
};
