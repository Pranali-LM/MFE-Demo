import { FooterComponentItem } from '@app-shared/components/footers/footer.model';
import { LmFooterComponent } from '@app-shared/components/footers/lm-footer/lm-footer.component';
import { ClientConfig, DEFAULT_CLIENT_CONFIG } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'lmpresales',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/lmpresales/light-logo.svg',
    darkLogo: 'assets/lmpresales/dark-logo.svg',
    alt: 'LightMetrics',
    width: '148px',
    height: '36px',
  },
  showSurveyButton: true,
  showCopyrightText: true,
  showPrivacyPolicyLink: true,
  landingPageDetails: {
    backgroundImage: {
      src: 'assets/lmpresales/login-page-bg.jpg',
    },
    brandImage: {
      src: 'assets/lmpresales/dark-logo.svg',
    },
    headerImage: {
      src: 'assets/lmpresales/login-page-header.svg',
    },
    tagline: 'Making roads safer for everyone, everywhere.',
    footer: new FooterComponentItem(LmFooterComponent),
  },
  showLandingPage: true,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
