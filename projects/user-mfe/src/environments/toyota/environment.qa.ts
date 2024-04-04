import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-qa.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://tfmproview-fleetlocate-qa.lightmetrics.co/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-southeast-2': {
      clientID: '50gm0uulej3istrsedmrapkgih',
      domain: 'https://fleet-portal-fl.auth.ap-southeast-2.amazoncognito.com',
    },
  },
};
