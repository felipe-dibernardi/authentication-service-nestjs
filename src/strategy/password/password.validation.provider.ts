import { Provider } from '@nestjs/common';
import { OneOfEachPasswordValidationStrategy } from './oneofeach.password.validation.strategy';

export const PasswordValidationProvider: Provider = {
  provide: 'PasswordValidation',
  useClass: OneOfEachPasswordValidationStrategy,
};
