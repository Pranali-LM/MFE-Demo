import { IEnvironment } from '@env/environment.model';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: IEnvironment = {
  production: false,
  legacy_api_server_url: 'http://localhost:2999',
  // intermediate_server_url: 'http://localhost:6001',
  intermediate_server_url: 'https://white-local-dev.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'http://localhost:4200/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-south-1': {
      clientID: '6rue7n3aov84kidhprool996c2',
      domain: 'https://fleet-managers.auth.ap-south-1.amazoncognito.com',
    },
    'eu-west-2': {
      clientID: '7vbqdeqgd2tlo8sc7k6hiulehv',
      domain: 'https://fleet-portal.auth.eu-west-2.amazoncognito.com',
    },
  },
  env: 'local',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
