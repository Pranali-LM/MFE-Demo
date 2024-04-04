import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-v2.lightmetrics.co',
  redirect_url: '',
  callbackURL: '',
  scopes: [],
  cognitoConfigs: {
    'ap-south-1': {
      clientID: '',
      domain: '',
    },
  },
};
