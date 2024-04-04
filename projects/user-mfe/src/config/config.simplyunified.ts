import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'simplyunified',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/simplyunified/light-logo.svg',
    darkLogo: 'assets/simplyunified/dark-logo.svg',
    alt: 'Simply Unified',
    width: '140px',
    height: '35px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
