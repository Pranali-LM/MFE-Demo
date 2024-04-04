import { ClientConfig, LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'loconavsecurex',
  ...LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/securex/light-logo.png',
    darkLogo: 'assets/securex/dark-logo.png',
    alt: 'Securex Agencies',
    width: '56px',
    height: '48px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
