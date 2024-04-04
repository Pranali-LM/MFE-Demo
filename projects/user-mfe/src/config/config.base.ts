import { FooterComponentItem } from '@app-shared/components/footers/footer.model';
import { LatLngLiteral } from 'leaflet';

interface Logo {
  lightLogo: string;
  darkLogo: string;
  alt: string;
  width?: string;
  height?: string;
  mobileModeLightLogo?: string;
  mobileModeDarkLogo?: string;
  mobileModeWidth?: string;
  mobileModeHeight?: string;
}

interface sideNavColor {
  lightBackgroundColor: string;
  lightColor: string;
  darkBackgroundColor: string;
  darkColor: string;
}

interface SsoStorageMapping {
  authenticated: string;
  accessToken: string;
}

export interface GeotabSsoStorageMapping {
  credentials: string;
  server: string;
}

export enum DefaultStorageType {
  LocalStorage = 'LocalStorage',
  SessionStorage = 'SessionStorage',
  Cookie = 'Cookie',
}

export enum DevicePrimaryKey {
  DeviceId = 'deviceId',
  SerialNumber = 'serialNumber',
}

export interface ClientConfig {
  clientName: string;
  logo: Logo;
  partnerLogo?: Logo;
  showLogo: boolean;
  showSurveyButton: boolean;
  showUserProfile: boolean;
  allowedRoutes: string[];
  authRoutes: string[];
  wildcardRoute: string;
  ssoLocalStorageKeys?: SsoStorageMapping | GeotabSsoStorageMapping;
  showCopyrightText?: boolean;
  showPrivacyPolicyLink?: boolean;
  showManageDriversTab: boolean;
  showChallengesTab: boolean;
  defaultMapCoordinates: LatLngLiteral;
  externalEventsLabel: string;
  showFeatureAnnouncement: boolean;
  showLogoutButton: boolean;
  defaultStorage: DefaultStorageType;
  devicePrimaryKey: DevicePrimaryKey;
  landingPageDetails?: {
    backgroundImage: {
      src: string;
    };
    brandImage?: {
      src: string;
    };
    headerImage: {
      src: string;
    };
    tagline?: string;
    footer: FooterComponentItem;
    disableRegionSelection?: boolean;
    defaultUserCountry?: string;
    allowedRegions?: string[];
  };
  showLandingPage: boolean;
  showPartnerLogo: boolean;
  showSecurityButton?: boolean;
  showHomePageAnnouncement?: boolean;
  showFeedbackButton?: boolean;
  sideNavColor?: sideNavColor;
  showUserTypeEmail?: boolean;
  showTheme?: boolean;
  showHeader?: boolean;
  showSideNav?: boolean;
  isAssetCentric?: boolean;
}

export const internalRoutes = ['trip-details', 'request-video'];

export const DEFAULT_CLIENT_CONFIG = {
  logo: {
    path: '',
    alt: '',
    width: '',
    height: '',
  },
  showLogo: true,
  showSurveyButton: false,
  showUserProfile: true,
  showManageDriversTab: true,
  showChallengesTab: true,
  allowedRoutes: [
    'home',
    // 'safety-events',
    // 'trips',
    // 'live-view',
    // 'coaching',
    // 'video-requests',
    // 'drivers',
    // 'challenges',
    // 'reports',
    // 'assets',
    'user-management',
    // 'configurations',
  ],
  authRoutes: ['callback', 'tsplogin', 'admin-login', 'login', 'unauthorized-error'],
  wildcardRoute: 'callback',
  defaultMapCoordinates: {
    lat: 40.25,
    lng: -74.5,
  },
  externalEventsLabel: 'Panic Button',
  showFeatureAnnouncement: true,
  showLogoutButton: true,
  defaultStorage: DefaultStorageType.LocalStorage,
  devicePrimaryKey: DevicePrimaryKey.DeviceId,
  showLandingPage: false,
  showPartnerLogo: false,
  showSecurityButton: true,
  showHomePageAnnouncement: false,
  showFeedbackButton: true,
  showUserTypeEmail: true,
  showTheme: true,
  showHeader: true,
  showSideNav: true,
  isAssetCentric: false,
};

export const LOCONAV_RESELLER_DEFAULT_CLIENT_CONFIG = {
  ...DEFAULT_CLIENT_CONFIG,
  showChallengesTab: false,
  allowedRoutes: [
    'home',
    'safety-events',
    'trips',
    'live-view',
    'coaching',
    'video-requests',
    'drivers',
    'assets',
    'user-management',
    'configurations',
  ],
};

export const GEOTAB_RESELLER_DEFAULT_CLIENT_CONFIG = {
  ...DEFAULT_CLIENT_CONFIG,
  authRoutes: ['geotab-login', 'tsplogin'],
  wildcardRoute: 'geotab-login',
  ssoLocalStorageKeys: {
    credentials: 'geotab.credentials',
    server: 'geotab.server',
  },
  showUserProfile: true,
  showSurveyButton: true,
  showCopyrightText: true,
  showPrivacyPolicyLink: true,
  showLogoutButton: false,
  showSecurityButton: false,
  showFeatureAnnouncement: false,
  defaultStorage: DefaultStorageType.SessionStorage,
};
