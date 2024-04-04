import { IEnvironment } from '@env/environment.model';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --test` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers-dev.lightmetrics.co',
  intermediate_server_url: 'https://white-dev.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://dashboard-dev.lightmetrics.co/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-south-1': {
      clientID: '217n8krqkbgn01okk1lb06kbc1',
      domain: 'https://fleet-managers.auth.ap-south-1.amazoncognito.com',
    },
  },
  env: 'dev',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
