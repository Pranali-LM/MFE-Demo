import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: false,
  legacy_api_server_url: 'http://localhost:2999',
  intermediate_server_url: 'http://localhost:6001',
  redirect_url: 'https://app.stagingsynergy.com',
  callbackURL: '',
  scopes: [],
  cognitoConfigs: {
    'ap-south-1': {
      clientID: '',
      domain: '',
    },
  },
};
