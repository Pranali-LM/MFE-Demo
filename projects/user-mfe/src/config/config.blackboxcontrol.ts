import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'blackboxcontrol',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/blackboxcontrol/light-logo.png',
    darkLogo: 'assets/blackboxcontrol/dark-logo.png',
    alt: 'BlackBox Control',
    width: '120px',
    height: '35px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
