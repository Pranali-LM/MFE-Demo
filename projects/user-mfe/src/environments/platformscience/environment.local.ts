import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: false,
  legacy_api_server_url: 'http://localhost:2999',
  intermediate_server_url: 'https://white-local-dev.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'http://localhost:4200/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-south-1': {
      clientID: '6mppn9ur1pcgck8qiesr6edpf6',
      domain: 'https://fleet-managers.auth.ap-south-1.amazoncognito.com',
    },
  },
};
