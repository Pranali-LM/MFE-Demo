import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-loconav.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://www.rts-vt.com/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'us-east-1': {
      clientID: 'h2raenm3eds2memuluo62ph0f',
      domain: 'https://fleet-dashboard.auth.us-east-1.amazoncognito.com',
    },
  },
};
