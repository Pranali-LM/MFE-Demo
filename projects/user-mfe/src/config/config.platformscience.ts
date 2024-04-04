import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'platformscience',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/platformscience/light-logo.svg',
    darkLogo: 'assets/platformscience/dark-logo.svg',
    alt: 'RideView',
    width: '148px',
    height: '36px',
    mobileModeLightLogo: 'assets/platformscience/mobile-mode-light-logo.svg',
    mobileModeDarkLogo: 'assets/platformscience/mobile-mode-dark-logo.svg',
    mobileModeWidth: '40px',
    mobileModeHeight: '36px',
  },
  partnerLogo: {
    lightLogo: 'assets/platformscience/partner-light-logo.png',
    darkLogo: 'assets/platformscience/partner-dark-logo.png',
    alt: 'RideView',
    width: '160px',
    height: '46px',
    mobileModeLightLogo: 'assets/platformscience/partner-mobile-mode-light-logo.png',
    mobileModeDarkLogo: 'assets/platformscience/partner-mobile-mode-dark-logo.png',
    mobileModeWidth: '40px',
    mobileModeHeight: '36px',
  },
  showPartnerLogo: true,
  showHomePageAnnouncement: false,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
