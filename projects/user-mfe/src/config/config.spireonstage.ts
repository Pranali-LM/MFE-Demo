import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'spireonstage',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: '',
    darkLogo: '',
    alt: '',
    width: '',
    height: '',
  },
  isAssetCentric: true,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
