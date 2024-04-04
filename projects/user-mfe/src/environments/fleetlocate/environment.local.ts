import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: false,
  legacy_api_server_url: 'http://localhost:2999',
  intermediate_server_url: 'http://localhost:6002',
  redirect_url: '',
  callbackURL: 'http://localhost:4500/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-southeast-2': {
      clientID: 'cv1892259m3a0ipo0tib4q5jb',
      domain: 'https://fleet-portal-fl.auth.ap-southeast-2.amazoncognito.com',
    },
  },
};
