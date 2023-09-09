import { Provider } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

export const AuthGuardProvider: Provider = {
  provide: 'AuthGuard',
  useClass: AuthGuard,
};
