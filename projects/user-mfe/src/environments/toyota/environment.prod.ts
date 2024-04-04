import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-v2.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://tfmproview.fleetlocate.com.au/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-southeast-2': {
      clientID: '50gm0uulej3istrsedmrapkgih',
      domain: 'https://fleet-portal-fl.auth.ap-southeast-2.amazoncognito.com',
    },
  },
};
