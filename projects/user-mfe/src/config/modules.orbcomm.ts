import { AuthenticationModule } from '@app-auth/authentication.module';
import { IframeAuthenticationModule } from 'src/app/iframe-authentication/iframe-authentication.module';

export const authModules = [AuthenticationModule, IframeAuthenticationModule];
