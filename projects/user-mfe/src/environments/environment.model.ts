interface CognitoConfig {
  clientID: string;
  domain: string;
}

export interface IEnvironment {
  production: boolean;
  legacy_api_server_url: string;
  intermediate_server_url: string;
  redirect_url: string;
  callbackURL: string;
  scopes: string[];
  cognitoConfigs: { [key: string]: CognitoConfig };
  env?: string;
}
