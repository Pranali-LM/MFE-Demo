import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'easitrack',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/easitrack/light-logo.svg',
    darkLogo: 'assets/easitrack/dark-logo.svg',
    alt: 'EasiTrack',
    width: '114px',
    height: '80px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
