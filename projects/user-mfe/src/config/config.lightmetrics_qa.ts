import { FooterComponentItem } from '@app-shared/components/footers/footer.model';
import { LmFooterComponent } from '@app-shared/components/footers/lm-footer/lm-footer.component';
import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'lightmetrics_qa',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/lightmetrics_qa/light-logo.svg',
    darkLogo: 'assets/lightmetrics_qa/dark-logo.svg',
    alt: 'LightMetrics',
    width: '140px',
    height: '40px',
  },
  showSurveyButton: true,
  landingPageDetails: {
    backgroundImage: {
      src: 'assets/lightmetrics_qa/login-page-bg.jpg',
    },
    brandImage: {
      src: 'assets/lightmetrics_qa/dark-logo.svg',
    },
    headerImage: {
      src: 'assets/lightmetrics_qa/login-page-header.svg',
    },
    tagline: 'Making roads safer for everyone, everywhere.',
    footer: new FooterComponentItem(LmFooterComponent),
  },
  showLandingPage: true,
  isAssetCentric: true,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
