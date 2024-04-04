import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'machinemax',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/machinemax/light-logo.png',
    darkLogo: 'assets/machinemax/dark-logo.png',
    alt: 'MachineMax',
    width: '180px',
    height: '26px',
  },
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
