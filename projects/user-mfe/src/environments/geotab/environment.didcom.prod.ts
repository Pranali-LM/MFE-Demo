import { IEnvironment } from '@env/environment.model';

export const environment: IEnvironment = {
  production: true,
  legacy_api_server_url: 'https://developers.lightmetrics.co',
  intermediate_server_url: 'https://white-v2.lightmetrics.co',
  redirect_url: 'https://geotab-didcom-addin-fp.lightmetrics.co/page-not-found',
  callbackURL: '',
  scopes: [],
  cognitoConfigs: {
    'us-east-1': {
      clientID: '',
      domain: '',
    },
  },
};
