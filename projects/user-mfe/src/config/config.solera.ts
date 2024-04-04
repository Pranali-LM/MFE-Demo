import { FooterComponentItem } from '@app-shared/components/footers/footer.model';
import { SoleraFooterComponent } from '@app-shared/components/footers/solera-footer/solera-footer.component';
import { ClientConfig, DEFAULT_CLIENT_CONFIG, DevicePrimaryKey } from './config.base';
import { navigationRoutes as BaseLinks, RouteParams } from './links.base';

export const CLIENT_CONFIG: ClientConfig = {
  clientName: 'solera',
  ...DEFAULT_CLIENT_CONFIG,
  logo: {
    lightLogo: 'assets/solera/light-logo.svg',
    darkLogo: 'assets/solera/dark-logo.svg',
    alt: 'Solera',
    width: '200px',
    height: '56px',
  },
  devicePrimaryKey: DevicePrimaryKey.SerialNumber,
  landingPageDetails: {
    backgroundImage: {
      src: 'assets/solera/login-page-bg.jpg',
    },
    headerImage: {
      src: 'assets/solera/light-logo.svg',
    },
    tagline: '',
    footer: new FooterComponentItem(SoleraFooterComponent),
    allowedRegions: ['CAN', 'LATAM', 'USA', 'UK'],
  },
  showLandingPage: true,
};

export const navigationRoutes: RouteParams[] = CLIENT_CONFIG.allowedRoutes.map((x) => BaseLinks[x]);
