import { ClientConfig, LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'loconav',
  ...LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/loconav/light-logo.svg',
    darkLogo: 'assets/loconav/dark-logo.svg',
    alt: 'Loconav',
    width: '140px',
    height: '40px',
  },
  defaultMapCoordinates: {
    lat: 51.507351,
    lng: -0.127758,
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
