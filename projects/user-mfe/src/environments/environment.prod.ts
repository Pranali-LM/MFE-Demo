import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-v2.lightmetrics.co',
  redirect_url: '',
  callbackURL: 'https://dashboard.lightmetrics.co/callback',
  scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
  cognitoConfigs: {
    'us-east-1': {
      clientID: '6tdhtdnlkpf2eb1keln4egil16',
      domain: 'https://fleet-dashboard.auth.us-east-1.amazoncognito.com',
    },
    'eu-west-2': {
      clientID: '7vbqdeqgd2tlo8sc7k6hiulehv',
      domain: 'https://fleet-portal.auth.eu-west-2.amazoncognito.com',
    },
    'ap-southeast-2': {
      clientID: '2kn3ue6eriu7r4170kfl3r4h07',
      domain: 'https://fleet-portal.auth.ap-southeast-2.amazoncognito.com',
    },
  },
  env: 'prod',
};
