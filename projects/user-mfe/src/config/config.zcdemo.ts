import { FooterComponentItem } from '@app-shared/components/footers/footer.model';
import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';
import { ZcdemoFooterComponent } from '@app-shared/footers/zcdemo-footer/zcdemo-footer.component';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'zcdemo',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/zcdemo/light-logo.svg',
    darkLogo: 'assets/zcdemo/dark-logo.svg',
    alt: 'Zonar',
    width: '108px',
    height: '28px',
  },
  showFeatureAnnouncement: false,
  landingPageDetails: {
    backgroundImage: {
      src: 'assets/zcdemo/zonar-banner-bg.svg',
    },
    brandImage: {
      src: 'assets/zcdemo/dark-logo.svg',
    },
    headerImage: {
      src: 'assets/zcdemo/zonar-logo.svg',
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
  showTheme: false,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
