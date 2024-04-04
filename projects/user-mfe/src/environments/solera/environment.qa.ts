import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-qa.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://protect-smartdrive.lightmetrics.co/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'us-east-1': {
      clientID: '4gr9qdgk7cha3r7qbg3l6tk5pj',
      domain: 'https://solera-fleet-portal.auth.us-east-1.amazoncognito.com',
    },
    'eu-west-2': {
      clientID: '2984322m3ovm671p4364u71plo',
      domain: 'https://solera-fleet-portal.auth.eu-west-2.amazoncognito.com',
    },
  },
};
