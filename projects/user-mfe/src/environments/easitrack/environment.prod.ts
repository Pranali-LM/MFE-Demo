import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-v2.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://video.easitrack.net/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'us-east-1': {
      clientID: '5aj1elth74vkiqasvs3l7ip2v5',
      domain: 'https://fleet-dashboard.auth.us-east-1.amazoncognito.com',
    },
  },
};
