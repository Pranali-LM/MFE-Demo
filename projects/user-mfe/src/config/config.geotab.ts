import { ClientConfig, GEOTAB_RESELLER_DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'geotab',
  ...GEOTAB_RESELLER_DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/lmpresales/light-logo.svg',
    darkLogo: 'assets/lmpresales/dark-logo.svg',
    alt: 'LightMetrics',
    width: '148px',
    height: '36px',
  },
  showTheme: false,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
