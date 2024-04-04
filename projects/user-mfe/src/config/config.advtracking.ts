import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'advtracking',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/advtracking/light-logo.png',
    darkLogo: 'assets/advtracking/dark-logo.png',
    alt: 'Advantage One Vision',
    width: '220px',
    height: '30px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
