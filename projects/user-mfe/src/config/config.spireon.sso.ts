import { ClientConfig, DefaultStorageType, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'spireon',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: '',
    darkLogo: '',
    alt: '',
    width: '',
    height: '',
  },
  authRoutes: ['iframe-implicit-login', 'tsplogin', 'admin-login', 'unauthorized-error'],
  wildcardRoute: 'iframe-implicit-login',
  showHeader: false,
  showSideNav: false,
  showFeatureAnnouncement: false,
  showFeedbackButton: false,
  defaultStorage: DefaultStorageType.SessionStorage,
  isAssetCentric: true,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
