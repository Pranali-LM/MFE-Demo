import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-beta.lightmetrics.co',
  redirect_url: '',
  callbackURL: '',
  scopes: [],
  cognitoConfigs: {
    'ap-southeast-2': {
      clientID: '',
      domain: '',
    },
  },
};
