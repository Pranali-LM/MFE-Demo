import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: false,
  legacy_api_server_url: 'http://localhost:9903',
  intermediate_server_url: 'http://localhost:6001',
  redirect_url: '',
  callbackURL: 'http://localhost:4200/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'ap-south-1': {
      clientID: '6rue7n3aov84kidhprool996c2',
      domain: 'https://fleet-managers.auth.ap-south-1.amazoncognito.com',
    },
  },
};
