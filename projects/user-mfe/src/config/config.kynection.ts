import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'kynection',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/kynection/light-logo.svg',
    darkLogo: 'assets/kynection/dark-logo.svg',
    alt: 'Kynection',
    width: '160px',
    height: '32px',
  },
  defaultMapCoordinates: {
    lat: -33.865143,
    lng: 151.2099,
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
