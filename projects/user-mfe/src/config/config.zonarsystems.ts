import { FooterComponentItem } from '@app-shared/components/footers/footer.model';
import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';
import { ZcdemoFooterComponent } from '@app-shared/footers/zcdemo-footer/zcdemo-footer.component';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'zonarsystems',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/zonarsystems/light-logo.svg',
    darkLogo: 'assets/zonarsystems/dark-logo.svg',
    alt: 'Zonar',
    width: '108px',
    height: '28px',
  },
  showFeatureAnnouncement: false,
  landingPageDetails: {
    backgroundImage: {
      src: 'assets/zonarsystems/zonarsystems-banner-bg.svg',
    },
    brandImage: {
      src: 'assets/zonarsystems/dark-logo.svg',
    },
    headerImage: {
      src: 'assets/zonarsystems/zonarsystems-logo.svg',
    },
    tagline: '',
    footer: new FooterComponentItem(ZcdemoFooterComponent),
  },
  showLandingPage: true,
  showFeedbackButton: false,
  sideNavColor: {
    lightBackgroundColor: '#005481',
    lightColor: '#bcd7ed',
    darkBackgroundColor: '#005481',
    darkColor: '#bcd7ed',
  },
  showUserTypeEmail: false,
  showTheme: false,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
