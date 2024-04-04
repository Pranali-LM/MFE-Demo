import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-loconav.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://www.smarttrackjo-pro-cam.com/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'us-east-1': {
      clientID: '5p0g6r2kj5r0a4hchvd1ft70i1',
      domain: 'https://fleet-dashboard.auth.us-east-1.amazoncognito.com',
    },
  },
};
