import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'polysurance',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/polysurance/light-logo.png',
    darkLogo: 'assets/polysurance/dark-logo.png',
    alt: 'Polysurance',
    width: '160px',
    height: '56px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
