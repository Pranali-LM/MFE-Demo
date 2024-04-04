import { ClientConfig, LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'smarttrackpro',
  ...LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/smarttrack/light-logo.svg',
    darkLogo: 'assets/smarttrack/dark-logo.svg',
    alt: 'Smart Track',
    width: '150px',
    height: '56px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
