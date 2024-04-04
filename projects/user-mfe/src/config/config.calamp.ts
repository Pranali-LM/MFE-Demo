import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'calamp',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/calamp/light-logo.svg',
    darkLogo: 'assets/calamp/dark-logo.svg',
    alt: 'Calamp',
    width: '96px',
    height: '48px',
  },
  showManageDriversTab: false,
  externalEventsLabel: 'External Trigger',
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
