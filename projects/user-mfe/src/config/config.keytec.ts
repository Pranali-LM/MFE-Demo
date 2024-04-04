import { ClientConfig, LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'keytec',
  ...LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/keytec/light-logo.svg',
    darkLogo: 'assets/keytec/dark-logo.svg',
    alt: 'KeyTec',
    width: '120px',
    height: '48px',
  },
  defaultMapCoordinates: {
    lat: 51.507351,
    lng: -0.127758,
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
