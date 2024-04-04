import { ClientConfig, LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'fleettracking',
  ...LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/fleettracking/light-logo.png',
    darkLogo: 'assets/fleettracking/dark-logo.png',
    alt: 'Fleet Tracking',
    width: '180px',
    height: '60px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
