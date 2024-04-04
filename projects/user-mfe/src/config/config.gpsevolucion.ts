import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'gpsevolucion',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/gpsevolucion/light-logo.png',
    darkLogo: 'assets/gpsevolucion/dark-logo.png',
    alt: 'GPS Evolucion',
    width: '180px',
    height: '30px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
