import { ClientConfig, GEOTAB_RESELLER_DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'iotab',
  ...GEOTAB_RESELLER_DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/iotab/light-logo.png',
    darkLogo: 'assets/iotab/dark-logo.png',
    alt: 'IoTab',
    width: '94px',
    height: '60px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
