// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --test` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers-dev.lightmetrics.co',
  intermediate_server_url: 'https://white-dev.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://ps-qa.rideview.ai/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-south-1': {
      clientID: '6mppn9ur1pcgck8qiesr6edpf6',
      domain: 'https://fleet-managers.auth.ap-south-1.amazoncognito.com',
    },
  },
  env: 'prod',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
