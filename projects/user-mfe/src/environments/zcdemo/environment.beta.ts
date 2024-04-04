import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-beta.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://zcdemo.lightmetrics.co/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'us-east-1': {
      clientID: '22c42o7vn5cuh3fi96gq2i52qn',
      domain: 'https://fleet-dashboard.auth.us-east-1.amazoncognito.com',
    },
  },
};
