import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: false,
  legacy_api_server_url: 'http://localhost:2999',
  intermediate_server_url: 'http://localhost:6001',
  redirect_url: '',
  callbackURL: 'http://localhost:4203/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-southeast-2': {
      clientID: '6aillnjrn7523sv5f3icaoffq',
      domain: 'https://fleet-portal.auth.ap-southeast-2.amazoncognito.com',
    },
  },
};
